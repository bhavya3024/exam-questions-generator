import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const resolvedParams = await params;
  const { runId } = resolvedParams;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendStatus = (status: string, progress: number, message: string) => {
        controller.enqueue(
          encoder.encode(
            `event: status\ndata: ${JSON.stringify({ status, progress, message })}\n\n`
          )
        );
      };

      const sendComplete = (paper: any) => {
        controller.enqueue(
          encoder.encode(
            `event: complete\ndata: ${JSON.stringify({ paper })}\n\n`
          )
        );
      };

      const sendError = (message: string) => {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ message })}\n\n`
          )
        );
      };

      const sendPing = () => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      };

      let pollInterval: NodeJS.Timeout | undefined;
      let lastProgress = -1;
      let lastMessage = "";
      let lastSentTime = Date.now();

      try {
        sendStatus("ingesting", 10, "Fetching config details...");

        const db = await getDb();

        // Start active background polling of MongoDB to get real-time intermediate progress percentages
        pollInterval = setInterval(async () => {
          try {
            const freshDoc = await db.collection("papers").findOne({ run_id: runId });
            
            if (!freshDoc) {
              sendError("Generation configuration not found in database");
              clearInterval(pollInterval);
              controller.close();
              return;
            }

            // Stream errors
            if (freshDoc.status === "error" || freshDoc.error) {
              sendError(freshDoc.error || "Generation encountered an unexpected error");
              clearInterval(pollInterval);
              controller.close();
              return;
            }

            // Stream completion
            if (freshDoc.status === "completed" && freshDoc.paper) {
              sendStatus("done", 100, "Paper generation complete!");
              sendComplete(freshDoc.paper);
              clearInterval(pollInterval);
              controller.close();
              return;
            }

            // Stream intermediate updates
            const progress = freshDoc.progress ?? lastProgress;
            const message = freshDoc.status_message ?? lastMessage;
            
            if (progress !== lastProgress || message !== lastMessage) {
              lastProgress = progress;
              lastMessage = message;
              lastSentTime = Date.now();
              sendStatus(freshDoc.status || "processing", progress, message);
            } else if (Date.now() - lastSentTime > 10000) {
              sendPing();
              lastSentTime = Date.now();
            }
          } catch (dbErr) {
            console.error("Error reading run progress from MongoDB:", dbErr);
          }
        }, 1000);

      } catch (err: any) {
        console.error("Error in SSE polling proxy stream:", err);
        sendError(err.message || "Failed during generation monitoring");
        if (pollInterval) clearInterval(pollInterval);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
