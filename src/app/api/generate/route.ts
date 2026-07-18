import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:2024";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Generate a unique run ID for this generation session
    const runId = crypto.randomUUID();

    // 2. Fetch matching reference documents from MongoDB paths based on class and subject
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

    // 3. Merge MongoDB references with any ad-hoc files uploaded in this request session
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
      special_instructions: body.special_instructions || ""
    };

    // 4. Save the run configuration to MongoDB
    const db = await getDb();
    await db.collection("papers").insertOne({
      _id: runId as any,
      run_id: runId,
      status: "processing",
      progress: 10,
      status_message: "Initializing generation session...",
      exam_config: examConfig,
      document_urls: combinedUrls,
      created_at: new Date().toISOString()
    });

    console.log(`✨ Created generation session ${runId} with ${combinedUrls.length} references`);

    // 5. Trigger LangGraph background run asynchronously (non-blocking) on port 2024 using thread run triggers
    try {
      console.log(`🚀 Creating LangGraph thread at ${AGENT_URL}/threads`);
      const threadRes = await fetch(`${AGENT_URL}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!threadRes.ok) {
        throw new Error(`Failed to create thread: ${threadRes.statusText}`);
      }

      const threadData = await threadRes.json();
      const threadId = threadData.thread_id;
      console.log(`🧵 Created thread ${threadId}. Triggering background run...`);

      const agentPayload = {
        assistant_id: "exam-generator",
        input: {
          run_id: runId,
          exam_config: {
            ...examConfig,
            document_urls: combinedUrls
          }
        }
      };

      // Trigger the background run (this endpoint returns immediately and enqueues the job)
      const runRes = await fetch(`${AGENT_URL}/threads/${threadId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentPayload),
      });

      if (!runRes.ok) {
        const errText = await runRes.text();
        console.error(`Agent failed to trigger run on thread: ${errText}`);
      }

      console.log(`✅ LangGraph background run initiated successfully on thread ${threadId} for session ${runId}`);
    } catch (agentErr) {
      console.error("Error triggering LangGraph background run:", agentErr);
      // Update record to show background run failed to start
      await db.collection("papers").updateOne(
        { run_id: runId },
        {
          $set: {
            status: "error",
            error: "Failed to communicate with LangGraph background engine."
          }
        }
      );
      return NextResponse.json(
        { error: "Failed to communicate with LangGraph engine. Is the dev server running?" },
        { status: 502 }
      );
    }

    // Return 201 Created as requested
    return NextResponse.json({
      run_id: runId,
      status: "processing"
    }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create generation session";
    console.error("API error creating generation session:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
