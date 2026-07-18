"use client";
import { CheckCircle2, Loader2, AlertCircle, Clock, Brain, FileText, CheckSquare, Layout } from "lucide-react";

const STEPS = [
  { id: "ingesting", label: "Loading Documents", icon: FileText, progress: [0, 25] },
  { id: "retrieving", label: "Retrieving Context", icon: Brain, progress: [25, 40] },
  { id: "generating", label: "Generating Questions", icon: Loader2, progress: [40, 65] },
  { id: "validating", label: "Validating Quality", icon: CheckSquare, progress: [65, 80] },
  { id: "formatting", label: "Formatting Paper", icon: Layout, progress: [80, 100] },
  { id: "done", label: "Complete!", icon: CheckCircle2, progress: [100, 100] },
];

interface ProgressStreamProps {
  status: string;
  progress: number;
  message: string;
  error?: string;
}

export default function ProgressStream({ status, progress, message, error }: ProgressStreamProps) {
  const currentStepIndex = STEPS.findIndex((s) => s.id === status);

  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          borderRadius: "12px",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <p style={{ fontWeight: 600, color: "#ef4444", marginBottom: "4px" }}>Generation Failed</p>
          <p style={{ fontSize: "13px", color: "#94a3b8" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Overall Progress Bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>Overall Progress</span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {progress}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Current message */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          borderRadius: "10px",
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.15)",
        }}
      >
        <Loader2
          size={16}
          color="#6366f1"
          style={{ flexShrink: 0, animation: status !== "done" ? "spin-slow 1s linear infinite" : undefined }}
        />
        <span style={{ fontSize: "14px", color: "#f1f5f9" }}>{message || "Processing..."}</span>
      </div>

      {/* Step list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {STEPS.filter((s) => s.id !== "done").map((step, i) => {
          const isDone = i < currentStepIndex;
          const isActive = i === currentStepIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`status-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: isDone
                    ? "rgba(16,185,129,0.15)"
                    : isActive
                    ? "rgba(99,102,241,0.15)"
                    : "rgba(100,116,139,0.1)",
                  border: isDone
                    ? "1px solid rgba(16,185,129,0.3)"
                    : isActive
                    ? "1px solid rgba(99,102,241,0.3)"
                    : "1px solid rgba(100,116,139,0.2)",
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={14} color="#10b981" />
                ) : isActive ? (
                  <Icon
                    size={14}
                    color="#6366f1"
                    style={{ animation: "spin-slow 1s linear infinite" }}
                  />
                ) : (
                  <Clock size={14} color="#64748b" />
                )}
              </div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 400,
                  color: isDone ? "#10b981" : isActive ? "#f1f5f9" : "#64748b",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
