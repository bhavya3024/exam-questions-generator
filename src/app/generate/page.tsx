import type { Metadata } from "next";
import ExamForm from "@/components/ExamForm";
import { Sparkles, BookOpen, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Generate CBSE Question Paper — ExamForge",
  description: "Configure your CBSE Board exam parameters, upload syllabus/textbooks, and let AI generate a blueprint-compliant CBSE question paper.",
};

export default function GeneratePage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 80px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "20px",
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.3)",
            marginBottom: "20px",
          }}
        >
          <Sparkles size={14} color="#6366f1" />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#6366f1" }}>CBSE Blueprint Generator</span>
        </div>

        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 900,
            color: "#f1f5f9",
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          Create CBSE{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Question Paper
          </span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "540px", margin: "0 auto" }}>
          Generate standard Class 9-12 CBSE papers. Upload textbooks or reference documents, select difficulty distribution, and create compliance-vetted exams.
        </p>

        {/* Quick tips */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginTop: "24px",
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: BookOpen, text: "Curriculum & Syllabus Aligned" },
            { icon: ShieldCheck, text: "Vetted Marking Schemes" },
            { icon: Sparkles, text: "Competency-Based Questions" },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "#94a3b8",
                padding: "6px 14px",
                borderRadius: "8px",
                background: "rgba(99,102,241,0.05)",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <Icon size={12} color="#6366f1" />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      <ExamForm />
    </div>
  );
}
