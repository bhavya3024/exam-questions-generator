import Link from "next/link";
import { Sparkles, BookOpen, Upload, Zap, CheckCircle, ArrowRight, Brain, Award } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "CBSE Syllabus & NCERT Aligned",
    desc: "Specifically tuned for CBSE Classes 9-12 with precise focus on NCERT textbook content.",
    color: "#6366f1",
  },
  {
    icon: Upload,
    title: "Upload Study Materials",
    desc: "Import textbooks, syllabi, past board papers, or notes. The agent uses RAG to retrieve syllabus context.",
    color: "#8b5cf6",
  },
  {
    icon: Zap,
    title: "Vetted CBSE Question Types",
    desc: "Includes MCQs, Assertion-Reason, Short Answer-I/II, Long Answer, and Case-Based competency questions.",
    color: "#06b6d4",
  },
  {
    icon: CheckCircle,
    title: "Vetted Marking Schemes",
    desc: "Generates professional answers and evaluation keys (marking schemes) alongside the question paper.",
    color: "#10b981",
  },
];

const STEPS = [
  { num: "01", title: "Select CBSE Class & Subject", desc: "Choose Classes 9-12 and input your targeted chapter or syllabus unit" },
  { num: "02", title: "Configure CBSE Blueprint", desc: "Specify number of questions per mark section and set Easy/Medium/Hard distribution" },
  { num: "03", title: "Upload Textbooks & References", desc: "Upload NCERT chapters or past papers to anchor the agent's context" },
  { num: "04", title: "Download PDF & Answer Key", desc: "Generate a beautifully structured CBSE question paper with answer guidelines" },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ─── Hero ─── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "100px 24px 80px",
          textAlign: "center",
        }}
      >
        {/* Glow orbs */}
        <div
          className="glow-orb"
          style={{ width: "600px", height: "600px", background: "rgba(99,102,241,0.12)", top: "-200px", left: "-100px" }}
        />
        <div
          className="glow-orb"
          style={{ width: "500px", height: "500px", background: "rgba(139,92,246,0.08)", top: "-100px", right: "-50px", animationDelay: "3s" }}
        />

        <div style={{ position: "relative", maxWidth: "880px", margin: "0 auto" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              marginBottom: "32px",
            }}
          >
            <Sparkles size={14} color="#6366f1" />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#6366f1" }}>
              CBSE Pattern Vetted · LangGraph Agentic System
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(38px, 6.5vw, 68px)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "24px",
              color: "#f1f5f9",
            }}
          >
            Generate Vetted{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CBSE Exam Papers
            </span>
            <br />
            with NCERT & RAG Support
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#94a3b8",
              lineHeight: 1.7,
              marginBottom: "40px",
              maxWidth: "640px",
              margin: "0 auto 40px",
            }}
          >
            Build blueprint-aligned CBSE Question Papers for Class IX to XII. Upload textbook PDFs or syllabus sheets, define marks structure, and generate papers with full marking schemes.
          </p>

          {/* CTA */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/generate">
              <button className="btn-primary" style={{ padding: "16px 36px", fontSize: "16px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={18} />
                  Start CBSE Blueprint
                </span>
              </button>
            </Link>
            <Link href="/history">
              <button className="btn-secondary" style={{ padding: "16px 36px", fontSize: "16px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <BookOpen size={18} />
                  Browse Past Papers
                </span>
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "48px",
              marginTop: "64px",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "Class 9-12", label: "Target Standards" },
              { value: "5 Sections", label: "CBSE Blueprint Pattern" },
              { value: "NCERT", label: "Core Curriculum Base" },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "32px",
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginBottom: "4px",
                  }}
                >
                  {value}
                </p>
                <p style={{ fontSize: "13px", color: "#64748b" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section style={{ padding: "80px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              color: "#f1f5f9",
              marginBottom: "16px",
            }}
          >
            Syllabus Vetted CBSE Assessment Engine
          </h2>
          <p style={{ color: "#64748b", fontSize: "16px" }}>
            Ensuring curriculum compliance, Bloom's level distribution, and marking keys
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="glass glass-hover" style={{ padding: "28px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: `${f.color}15`,
                    border: `1px solid ${f.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "15px", color: "#f1f5f9", marginBottom: "8px" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section
        style={{
          padding: "80px 24px",
          background: "rgba(99,102,241,0.03)",
          borderTop: "1px solid rgba(99,102,241,0.08)",
          borderBottom: "1px solid rgba(99,102,241,0.08)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 800,
                color: "#f1f5f9",
                marginBottom: "16px",
              }}
            >
              The CBSE Paper Blueprint Process
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="glass"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  padding: "20px 24px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "28px",
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    flexShrink: 0,
                    width: "48px",
                  }}
                >
                  {step.num}
                </span>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "15px", color: "#f1f5f9", marginBottom: "4px" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b" }}>{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight size={18} color="#64748b" style={{ marginLeft: "auto", flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 900,
              color: "#f1f5f9",
              marginBottom: "20px",
            }}
          >
            Create Board-Compliant Papers Instantly
          </h2>
          <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "16px" }}>
            Fully free CBSE Board generator for teachers and schools. Vetted marking patterns, case studies, and assertion-reason setups.
          </p>
          <Link href="/generate">
            <button className="btn-primary animate-pulse-glow" style={{ padding: "18px 48px", fontSize: "17px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Sparkles size={20} />
                Generate CBSE Paper Now
              </span>
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
