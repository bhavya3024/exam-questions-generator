import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { runId } = resolvedParams;
    
    const db = await getDb();
    const paper = await db
      .collection("papers")
      .findOne({ run_id: runId }, { projection: { _id: 0 } });

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    return NextResponse.json(paper);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch paper";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
