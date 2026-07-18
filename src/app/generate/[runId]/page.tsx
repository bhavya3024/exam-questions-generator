"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProgressStream from "@/components/ProgressStream";
import QuestionPaperView from "@/components/QuestionPaperView";
import { ExamPaper, createSSEStream } from "@/lib/agent";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface StreamStatus {
  status: string;
  progress: number;
  message: string;
}

export default function ResultPage() {
  const params = useParams();
  const runId = params.runId as string;
  const router = useRouter();

  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    status: "ingesting",
    progress: 5,
    message: "🚀 Connecting to agent...",
  });
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!runId) return;

    // Try to load existing paper first (for history navigation)
    fetch(`/api/papers/${runId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.status === "completed" && data?.paper) {
          setPaper(data.paper);
          setDone(true);
          setStreamStatus({ status: "done", progress: 100, message: "✅ Paper ready!" });
        } else {
          // Start SSE stream
          startStream();
        }
      })
      .catch(() => startStream());

    function startStream() {
      const cleanup = createSSEStream(
        runId,
        (data) => {
          setStreamStatus({ status: data.status, progress: data.progress, message: data.message });
        },
        (data) => {
          setPaper(data.paper);
          setDone(true);
          setStreamStatus({ status: "done", progress: 100, message: "✅ Your exam paper is ready!" });
        },
        (msg) => {
          setError(msg);
        }
      );
      return cleanup;
    }
  }, [runId]);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <Link href="/generate">
          <button
            className="btn-secondary"
            style={{ padding: "8px 14px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        </Link>
        <div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "22px",
              fontWeight: 800,
              color: "#f1f5f9",
            }}
          >
            {done ? "Exam Paper Ready" : "Generating Your Paper..."}
          </h1>
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
            Run ID: {runId}
          </p>
        </div>
      </div>

      {/* Progress (shown while generating) */}
      {!done && !error && (
        <div className="glass" style={{ padding: "28px", marginBottom: "24px" }}>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              color: "#f1f5f9",
              marginBottom: "20px",
            }}
          >
            Generation Progress
          </h2>
          <ProgressStream
            status={streamStatus.status}
            progress={streamStatus.progress}
            message={streamStatus.message}
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ marginBottom: "24px" }}>
          <ProgressStream
            status="error"
            progress={0}
            message=""
            error={error}
          />
          <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
            <button
              onClick={() => router.push("/generate")}
              className="btn-primary"
              style={{ fontSize: "14px", padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Paper view (shown when done) */}
      {done && paper && (
        <div className="fade-up">
          {/* Success banner */}
          <div
            style={{
              padding: "14px 20px",
              borderRadius: "12px",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🎉</span>
            <div>
              <p style={{ fontWeight: 600, color: "#10b981", fontSize: "14px" }}>
                Exam paper generated successfully!
              </p>
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                {paper.questions.length} questions · {paper.total_marks} marks · {paper.duration_minutes} minutes
              </p>
            </div>
          </div>

          <QuestionPaperView paper={paper} />
        </div>
      )}
    </div>
  );
}
