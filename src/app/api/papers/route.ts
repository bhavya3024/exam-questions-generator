import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = parseInt(searchParams.get("skip") || "0");

    const db = await getDb();
    const papers = await db
      .collection("papers")
      .find(
        { status: "completed" },
        {
          projection: {
            _id: 0,
            run_id: 1,
            "exam_config.subject": 1,
            "exam_config.topic": 1,
            "exam_config.grade_level": 1,
            "paper.title": 1,
            "paper.total_marks": 1,
            created_at: 1,
          },
        }
      )
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({ papers, count: papers.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch papers";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
