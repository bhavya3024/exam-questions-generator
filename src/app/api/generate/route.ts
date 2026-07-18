import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Fetch matching reference documents from MongoDB paths based on class and subject
    let documentUrls: string[] = [];
    try {
      const db = await getDb();
      const assets = await db
        .collection("curriculum_assets")
        .find({
          cbse_class: body.cbse_class,
          subject: body.subject
        })
        .toArray();
      
      documentUrls = assets.map((asset: any) => asset.url);
      console.log(`🔍 Resolved ${documentUrls.length} reference documents from MongoDB for Class ${body.cbse_class} ${body.subject}`);
    } catch (dbErr) {
      console.error("Warning: Failed to fetch reference files from MongoDB, proceeding with empty reference list:", dbErr);
    }

    // 2. Merge MongoDB references with any ad-hoc files uploaded in this request session
    const combinedUrls = Array.from(new Set([
      ...documentUrls,
      ...(body.document_urls || [])
    ]));

    const examConfig = {
      subject: body.subject,
      topic: body.topic || "",
      cbse_class: body.cbse_class,
      total_marks: body.total_marks || 80,
      duration_minutes: body.duration_minutes || 180,
      mcq_count: body.mcq_count || 0,
      assertion_reason_count: body.assertion_reason_count || 0,
      very_short_answer_count: body.very_short_answer_count || 0,
      short_answer_count: body.short_answer_count || 0,
      short_answer_ii_count: body.short_answer_ii_count || 0,
      long_answer_count: body.long_answer_count || 0,
      case_based_count: body.case_based_count || 0,
      easy_percent: body.easy_percent || 30,
      medium_percent: body.medium_percent || 50,
      hard_percent: body.hard_percent || 20,
      document_urls: combinedUrls,
      special_instructions: body.special_instructions || ""
    };

    // 3. Trigger FastAPI backend generation
    try {
      console.log(`🚀 Triggering FastAPI backend at ${AGENT_URL}/generate`);
      const runRes = await fetch(`${AGENT_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examConfig),
      });

      if (!runRes.ok) {
        const errText = await runRes.text();
        console.error(`Backend failed to trigger run: ${errText}`);
        return NextResponse.json(
          { error: `Failed to communicate with LangGraph engine. Is the dev server running? ${errText}` },
          { status: 502 }
        );
      }

      const data = await runRes.json();
      console.log(`✅ Generation session started successfully. Run ID: ${data.run_id}`);
      
      // Return 201 Created
      return NextResponse.json(data, { status: 201 });
      
    } catch (agentErr) {
      console.error("Error triggering FastAPI backend run:", agentErr);
      return NextResponse.json(
        { error: "Failed to communicate with LangGraph engine. Is the dev server running?" },
        { status: 502 }
      );
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create generation session";
    console.error("API error creating generation session:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
