"use client";
import Link from "next/link";
import { PaperRecord } from "@/lib/agent";
import { Clock, BookOpen, Award, ArrowRight } from "lucide-react";

export default function PaperCard({ paper }: { paper: PaperRecord }) {
  const date = new Date(paper.created_at);
  const relativeTime = (() => {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  })();

  return (
    <Link href={`/generate/${paper.run_id}`} style={{ textDecoration: "none" }}>
      <div className="glass glass-hover" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: "16px",
                color: "#f1f5f9",
                marginBottom: "6px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {paper.paper?.title || `${paper.exam_config.subject} — ${paper.exam_config.topic}`}
            </h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}>
                <BookOpen size={12} color="#6366f1" />
                {paper.exam_config.subject}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}>
                <Award size={12} color="#8b5cf6" />
                {paper.paper?.total_marks || "—"} marks
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
                <Clock size={12} />
                {relativeTime}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              flexShrink: 0,
            }}
          >
            <ArrowRight size={16} color="#6366f1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
