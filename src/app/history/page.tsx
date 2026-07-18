import type { Metadata } from "next";
import { Clock, BookOpen, Sparkles } from "lucide-react";
import PaperCard from "@/components/PaperCard";
import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { PaperRecord } from "@/lib/agent";

export const metadata: Metadata = {
  title: "Paper History — ExamForge",
  description: "Browse all previously generated exam question papers.",
};

export const dynamic = "force-dynamic";

async function getPapersDirect(): Promise<PaperRecord[]> {
  try {
    const db = await getDb();
    const papers = await db
      .collection("papers")
      .find(
        { status: "completed" },
        {
          projection: {
            _id: 0,
            run_id: 1,
            exam_config: 1,
            "paper.title": 1,
            "paper.total_marks": 1,
            created_at: 1,
          },
        }
      )
      .sort({ created_at: -1 })
      .limit(30)
      .toArray();

    // Map Mongo docs to PaperRecord interface
    return papers.map((doc) => ({
      run_id: doc.run_id,
      exam_config: doc.exam_config,
      created_at: doc.created_at,
      status: "completed",
      paper: doc.paper ? {
        title: doc.paper.title,
        total_marks: doc.paper.total_marks,
      } : undefined
    })) as PaperRecord[];
  } catch (err) {
    console.error("Failed to query MongoDB directly in Server Component:", err);
    return [];
  }
}

export default async function HistoryPage() {
  const papers = await getPapersDirect();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            borderRadius: "20px",
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.3)",
            marginBottom: "16px",
          }}
        >
          <Clock size={13} color="#6366f1" />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#6366f1" }}>Generation History</span>
        </div>
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 800,
            color: "#f1f5f9",
            marginBottom: "8px",
          }}
        >
          Past Question Papers
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          All previously generated exam papers. Click any paper to view and download.
        </p>
      </div>

      {papers.length === 0 ? (
        /* Empty state */
        <div
          className="glass"
          style={{
            padding: "64px 32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <BookOpen size={28} color="#6366f1" />
          </div>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              color: "#f1f5f9",
              marginBottom: "10px",
            }}
          >
            No papers yet
          </h2>
          <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
            Generate your first exam paper to see it here.
          </p>
          <Link href="/generate">
            <button className="btn-primary" style={{ padding: "12px 28px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} />
                Generate First Paper
              </span>
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontSize: "13px", color: "#475569", marginBottom: "4px" }}>
            {papers.length} paper{papers.length !== 1 ? "s" : ""} generated
          </p>
          {papers.map((paper: PaperRecord) => (
            <PaperCard key={paper.run_id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}
