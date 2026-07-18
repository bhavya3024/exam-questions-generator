"use client";
import { ExamPaper, Question } from "@/lib/agent";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

interface Props {
  paper: ExamPaper;
  showAnswers?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  mcq: "MCQ",
  assertion_reason: "Assertion-Reason",
  very_short_answer: "Very Short Answer",
  short_answer: "Short Answer-I",
  short_answer_ii: "Short Answer-II",
  long_answer: "Long Answer",
  case_based: "Case-Based",
};

function QuestionCard({ q, index, showAnswers }: { q: Question; index: number; showAnswers: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const OPTIONS = ["a", "b", "c", "d"];

  return (
    <div className="question-card" style={{ marginBottom: "24px", pageBreakInside: "avoid" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
        <span style={{ fontWeight: 700, minWidth: "24px", fontSize: "15px" }}>
          {index + 1}.
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
            <span style={{ border: "1px solid #ccc", padding: "2px 6px", fontSize: "11px", borderRadius: "4px", background: "#f9f9f9" }}>
              {q.difficulty.toUpperCase()}
            </span>
            <span style={{ border: "1px solid #ccc", padding: "2px 6px", fontSize: "11px", borderRadius: "4px", background: "#f9f9f9" }}>
              {TYPE_LABELS[q.question_type] || q.question_type.toUpperCase()}
            </span>
            {q.blooms_level && (
              <span style={{ border: "1px solid #ccc", padding: "2px 6px", fontSize: "11px", borderRadius: "4px", background: "#f9f9f9" }}>
                {q.blooms_level.toUpperCase()}
              </span>
            )}
            <span style={{ border: "1px solid #ccc", padding: "2px 6px", fontSize: "11px", borderRadius: "4px", background: "#f9f9f9", fontWeight: 600 }}>
              {q.marks} Mark{q.marks > 1 ? "s" : ""}
            </span>
          </div>
          <div style={{ fontSize: "15px", lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {q.question_text}
          </div>
        </div>
      </div>

      {/* MCQ / Assertion-Reason Options */}
      {(q.question_type === "mcq" || q.question_type === "assertion_reason") && q.options && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginLeft: "36px", marginBottom: "12px" }}>
          {q.options.map((opt, i) => {
            const letter = OPTIONS[i];
            const isCorrect = showAnswers && (q.correct_answer === letter || q.correct_answer === letter.toUpperCase());
            // Strip leading "(a) ", "(b) ", etc. if the backend already included them
            const cleanOpt = opt.replace(/^\([a-dA-D]\)\s*/, "");
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontWeight: isCorrect ? 700 : 400,
                  color: isCorrect ? "#000" : "inherit"
                }}
              >
                <span>({letter})</span>
                <span>{cleanOpt}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Answers/Hints & Model Answers */}
      {showAnswers && (
        <div style={{ marginLeft: "36px", marginTop: "12px" }}>
          {q.correct_answer && (
            <div style={{ marginBottom: "8px", fontWeight: 700 }}>
              Correct Option: ({q.correct_answer.toLowerCase()})
            </div>
          )}
          
          {q.model_answer && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="no-print"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#666",
                  textDecoration: "underline",
                  marginBottom: "8px"
                }}
              >
                {expanded ? "Hide" : "Show"} Marking Scheme / Model Answer
              </button>
              {(expanded || true) /* In print we want to show it if showAnswers is true, but react controls display. Actually let's just let the state handle it. But to make it printable always when showAnswers is true, we should show it in print media. Let's just render it and use CSS to hide/show or just rely on the user expanding it before printing. Actually, it's better if we just show it if expanded. */}
              {expanded && (
                <div
                  style={{
                    padding: "10px",
                    borderLeft: "3px solid #ccc",
                    background: "#f9f9f9",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {q.model_answer}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuestionPaperView({ paper, showAnswers = false }: Props) {
  const [showAns, setShowAns] = useState(showAnswers);

  const handleDownload = () => {
    window.print();
  };

  const questionMap = Object.fromEntries(paper.questions.map((q) => [q.question_id, q]));

  const defaultInstructions = [
    "All questions are compulsory.",
    "This question paper contains five sections (Section A, B, C, D and E).",
    "Section A comprises MCQs and Assertion-Reason questions of 1 mark each.",
    "Section B comprises Very Short / Short Answer-I type questions of 2 marks each.",
    "Section C comprises Short Answer-II type questions of 3 marks each.",
    "Section D comprises Long Answer type questions of 5 marks each.",
    "Section E comprises Case-Based competency questions of 4 marks each.",
    "There is no overall choice. However, internal choices may be provided.",
    "Use of calculators is not permitted."
  ];

  const instructions = paper.general_instructions || defaultInstructions;

  return (
    <div>
      {/* Controls */}
      <div className="no-print" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => setShowAns(!showAns)}
          className="btn-secondary"
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          {showAns ? "Hide Answers / Scheme" : "Show Answers / Scheme"}
        </button>
        <button
          onClick={handleDownload}
          className="btn-primary"
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          <span>⬇ Download PDF (Print)</span>
        </button>
      </div>

      {/* Paper */}
      <div style={{ 
        background: "#ffffff", 
        color: "#000000", 
        padding: "40px", 
        borderRadius: "8px", 
        maxWidth: "900px", 
        margin: "0 auto", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "'Times New Roman', Times, serif"
      }}>
        {/* Board Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, textTransform: "uppercase", margin: 0 }}>
            Central Board of Secondary Education
          </h2>
          <p style={{ fontSize: "14px", margin: "4px 0 0 0" }}>Academic Session 2025-26</p>
        </div>

        {/* Paper Header */}
        <div style={{ textAlign: "center", paddingBottom: "20px", borderBottom: "2px solid #000", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 12px 0" }}>
            {paper.title}
          </h1>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", fontSize: "14px", fontWeight: 700 }}>
            <span>Class: {paper.cbse_class || "X"}</span>
            <span>Subject: {paper.subject}</span>
            <span>Max Marks: {paper.total_marks}</span>
            <span>Time Allowed: {paper.duration_minutes} Mins</span>
          </div>
        </div>

        {/* General Instructions */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase" }}>
            General Instructions:
          </h3>
          <ul style={{ paddingLeft: "24px", margin: 0, display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px" }}>
            {instructions.map((inst, idx) => (
              <li key={idx} style={{ lineHeight: "1.5" }}>
                {inst}
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        {(() => {
          let globalIndex = 0;
          return paper.sections.map((section, sIdx) => {
            const sectionQuestions = section.question_ids
              .map((id) => questionMap[id])
              .filter(Boolean);

            if (sectionQuestions.length === 0) return null;

            // Extract section letter from name like "Section A — ..." or fallback to A/B/C/D/E
            const sectionLetters = ["A", "B", "C", "D", "E"];
            const nameMatch = section.name?.match(/Section\s+([A-E])/i);
            const sectionLetter = nameMatch ? nameMatch[1].toUpperCase() : sectionLetters[sIdx] || "";

            const startIndex = globalIndex;
            globalIndex += sectionQuestions.length;

            return (
              <div key={sIdx} style={{ marginBottom: "32px" }}>
                {/* Section header */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "16px", textTransform: "uppercase", margin: 0 }}>
                    SECTION {sectionLetter}
                  </h3>
                  {section.description && (
                    <p style={{ fontSize: "14px", fontStyle: "italic", margin: "4px 0 0 0" }}>
                      ({section.description})
                    </p>
                  )}
                </div>

                {/* Questions */}
                {sectionQuestions.map((q, qIdx) => (
                  <QuestionCard key={q.question_id} q={q} index={startIndex + qIdx} showAnswers={showAns} />
                ))}
              </div>
            );
          });
        })()}

        {/* Footer */}
        <div style={{ textAlign: "center", paddingTop: "20px", borderTop: "1px solid #000", fontSize: "12px", marginTop: "40px" }}>
          Generated by ExamForge (CBSE Edition)
        </div>
      </div>
    </div>
  );
}
