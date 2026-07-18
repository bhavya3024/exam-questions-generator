import { NextRequest, NextResponse } from "next/server";

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "Missing document URL" }, { status: 400 });
    }

    // Trigger FastAPI backend extraction
    console.log(`🚀 Triggering Graph Extraction at ${AGENT_URL}/library/extract for ${url}`);
    const runRes = await fetch(`${AGENT_URL}/library/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!runRes.ok) {
      const errText = await runRes.text();
      console.error(`Backend failed to extract graph: ${errText}`);
      return NextResponse.json(
        { error: `Failed to communicate with LangGraph engine. ${errText}` },
        { status: 502 }
      );
    }

    const data = await runRes.json();
    
    // Save the extracted graph data to MongoDB if assetId was provided
    const { assetId } = body;
    if (assetId) {
      try {
        const { getDb } = await import("@/lib/mongodb");
        const { ObjectId } = await import("mongodb");
        const db = await getDb();
        await db.collection("curriculum_assets").updateOne(
          { _id: new ObjectId(assetId) },
          { $set: { graph: { nodes: data.nodes, relationships: data.relationships }, graph_extracted_at: new Date().toISOString() } }
        );
      } catch (dbErr) {
        console.error("Failed to save graph to MongoDB:", dbErr);
      }
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to extract graph";
    console.error("API error extracting graph:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
