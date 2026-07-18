"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FileUploadZone from "./FileUploadZone";
import { GenerateRequest } from "@/lib/agent";
import { Sparkles, ChevronDown, Info, File, CheckSquare, Square, Library } from "lucide-react";

interface Asset {
  _id: string;
  cbse_class: string;
  subject: string;
  category: string;
  filename: string;
  url: string;
  size_bytes: number;
}

const CBSE_CLASSES = {
  "9": "Class IX (Secondary)",
  "10": "Class X (Secondary - Board)",
  "11": "Class XI (Senior Secondary)",
  "12": "Class XII (Senior Secondary - Board)",
};

const CBSE_SUBJECTS: Record<string, string[]> = {
  "9": [
    "Mathematics",
    "Science",
    "Social Science",
    "English Language and Literature",
    "Hindi",
    "Information Technology",
  ],
  "10": [
    "Mathematics (Standard)",
    "Mathematics (Basic)",
    "Science",
    "Social Science",
    "English Language and Literature",
    "Hindi Course A",
    "Hindi Course B",
    "Computer Applications",
    "Information Technology",
  ],
  "11": [
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology",
    "Computer Science (Python)",
    "English Core",
    "Hindi Core",
    "Economics",
    "Business Studies",
    "Accountancy",
    "Political Science",
    "History",
    "Geography",
    "Physical Education",
    "Psychology",
  ],
  "12": [
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology",
    "Computer Science (Python)",
    "English Core",
    "Hindi Core",
    "Economics",
    "Business Studies",
    "Accountancy",
    "Political Science",
    "History",
    "Geography",
    "Physical Education",
    "Psychology",
  ],
};

const CATEGORY_LABELS: Record<string, string> = {
  textbook: "NCERT Textbook",
  past_paper: "Past Board Paper",
  syllabus: "Curriculum Syllabus",
  blueprint: "Design Blueprint",
};

const DEFAULT_FORM: GenerateRequest = {
  subject: "Science",
  topic: "",
  cbse_class: "10",
  total_marks: 80,
  duration_minutes: 180,
  mcq_count: 16,
  assertion_reason_count: 4,
  very_short_answer_count: 6,
  short_answer_count: 0,
  short_answer_ii_count: 7,
  long_answer_count: 3,
  case_based_count: 3,
  easy_percent: 30,
  medium_percent: 50,
  hard_percent: 20,
  document_urls: [],
  special_instructions: "",
};

function FormSection({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="glass" style={{ padding: "24px", marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <span className="section-number">{number}</span>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "16px", color: "#f1f5f9" }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function NumberInput({
  label, value, onChange, min = 0, max = 50, tooltip,
}: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; tooltip?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <label className="label" style={{ marginBottom: 0 }}>{label}</label>
        {tooltip && <span style={{ fontSize: "10px", color: "#64748b" }}>{tooltip}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
            color: "#6366f1", cursor: "pointer", fontSize: "18px", lineHeight: 1,
          }}
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
          className="input-field"
          style={{ width: "70px", textAlign: "center" }}
          min={min} max={max}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
            color: "#6366f1", cursor: "pointer", fontSize: "18px", lineHeight: 1,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function ExamForm() {
  const [form, setForm] = useState<GenerateRequest>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [libraryAssets, setLibraryAssets] = useState<Asset[]>([]);
  const [selectedAssetUrls, setSelectedAssetUrls] = useState<string[]>([]);
  const router = useRouter();

  const set = (key: keyof GenerateRequest, val: unknown) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleDifficultyChange = (key: "easy_percent" | "medium_percent" | "hard_percent", val: number) => {
    setForm((prev) => {
      const diff = val - prev[key];
      if (diff === 0) return prev;
      
      const otherKeys = (["easy_percent", "medium_percent", "hard_percent"] as const).filter(k => k !== key);
      const k1 = otherKeys[0];
      const k2 = otherKeys[1];
      
      let v1 = prev[k1];
      let v2 = prev[k2];
      
      const remain = 100 - val;
      if (remain < 0) return prev; 
      
      if (v1 + v2 === 0) {
         v1 = Math.floor(remain / 2);
         v2 = remain - v1;
      } else {
         const ratio = v1 / (v1 + v2);
         v1 = Math.round(remain * ratio);
         v2 = remain - v1;
      }
      
      return {
        ...prev,
        [key]: val,
        [k1]: v1,
        [k2]: v2
      };
    });
  };

  // Change subject when cbse_class changes to match available subjects
  useEffect(() => {
    const subjects = CBSE_SUBJECTS[form.cbse_class] || [];
    if (!subjects.includes(form.subject)) {
      set("subject", subjects[0] || "");
    }
  }, [form.cbse_class]);

  // Fetch catalog reference assets matching selected Class and Subject
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(`/api/assets?cbse_class=${form.cbse_class}&subject=${encodeURIComponent(form.subject)}`);
        if (res.ok) {
          const data = await res.json();
          const fetchedAssets = data.assets || [];
          setLibraryAssets(fetchedAssets);
          // Auto-select all matching catalog items for reference inclusion
          setSelectedAssetUrls(fetchedAssets.map((a: Asset) => a.url));
        }
      } catch (err) {
        console.error("Failed to load catalog references", err);
      }
    };
    fetchAssets();
  }, [form.cbse_class, form.subject]);

  const handleToggleAsset = (url: string) => {
    setSelectedAssetUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const totalQuestions =
    form.mcq_count + form.assertion_reason_count + form.very_short_answer_count +
    form.short_answer_count + form.short_answer_ii_count +
    form.long_answer_count + form.case_based_count;

  // Calculate standard marks distribution based on CBSE scheme:
  const estimatedMarks =
    form.mcq_count * 1 +
    form.assertion_reason_count * 1 +
    form.very_short_answer_count * 2 +
    form.short_answer_count * 2 +
    form.short_answer_ii_count * 3 +
    form.long_answer_count * 5 +
    form.case_based_count * 4;

  const diffTotal = form.easy_percent + form.medium_percent + form.hard_percent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (totalQuestions === 0) {
      toast.error("Add at least one question");
      return;
    }
    if (diffTotal !== 100) {
      toast.error(`Difficulty percentages must sum to 100 (currently ${diffTotal})`);
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Starting generation...");

    // Merge checked curriculum library assets with any files uploaded directly on this form
    const combinedUrls = Array.from(new Set([...selectedAssetUrls, ...form.document_urls]));
    const payload = {
      ...form,
      document_urls: combinedUrls,
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed to start");
      }

      const data = await res.json();
      toast.success("Generation started!", { id: toastId });
      router.push(`/generate/${data.run_id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start";
      toast.error(msg, { id: toastId });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Section 1: Basics */}
      <FormSection number={1} title="CBSE Exam Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label className="label">CBSE Class *</label>
            <div style={{ position: "relative" }}>
              <select
                className="input-field"
                value={form.cbse_class}
                onChange={(e) => set("cbse_class", e.target.value)}
                style={{ appearance: "none", paddingRight: "36px" }}
              >
                {Object.entries(CBSE_CLASSES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown size={16} color="#6366f1" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>
          <div>
            <label className="label">Subject *</label>
            <div style={{ position: "relative" }}>
              <select
                className="input-field"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
                style={{ appearance: "none", paddingRight: "36px" }}
              >
                {(CBSE_SUBJECTS[form.cbse_class] || []).map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
              <ChevronDown size={16} color="#6366f1" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>

          <div>
            <label className="label">Target Total Marks</label>
            <input
              type="number"
              className="input-field"
              value={form.total_marks}
              onChange={(e) => set("total_marks", parseInt(e.target.value) || 80)}
              min={10} max={100}
            />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input
              type="number"
              className="input-field"
              value={form.duration_minutes}
              onChange={(e) => set("duration_minutes", parseInt(e.target.value) || 180)}
              min={30} max={240}
            />
          </div>
        </div>
      </FormSection>

      {/* Section 2: Question Distribution */}
      <FormSection number={2} title="CBSE Pattern Question Blueprint">
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
          Configure questions matching standard CBSE sections:
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <NumberInput label="MCQs" value={form.mcq_count} onChange={(v) => set("mcq_count", v)} tooltip="1 mark each" />
          <NumberInput label="Assertion-Reason" value={form.assertion_reason_count} onChange={(v) => set("assertion_reason_count", v)} tooltip="1 mark each" />
          <NumberInput label="Very Short Answer" value={form.very_short_answer_count} onChange={(v) => set("very_short_answer_count", v)} tooltip="2 marks each" />
          <NumberInput label="Short Answer-I" value={form.short_answer_count} onChange={(v) => set("short_answer_count", v)} tooltip="2 marks each" />
          <NumberInput label="Short Answer-II" value={form.short_answer_ii_count} onChange={(v) => set("short_answer_ii_count", v)} tooltip="3 marks each" />
          <NumberInput label="Long Answers" value={form.long_answer_count} onChange={(v) => set("long_answer_count", v)} max={10} tooltip="5 marks each" />
          <NumberInput label="Case-based" value={form.case_based_count} onChange={(v) => set("case_based_count", v)} max={10} tooltip="4 marks each" />
        </div>
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.12)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Info size={14} color="#6366f1" />
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>
              Total: <strong style={{ color: "#f1f5f9" }}>{totalQuestions} questions</strong>
            </span>
          </div>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>
            Estimated Marks: <strong style={{ color: "#8b5cf6" }}>{estimatedMarks} / {form.total_marks}</strong>
          </span>
        </div>
      </FormSection>

      {/* Section 3: Difficulty */}
      <FormSection number={3} title="Difficulty / Cognitive Levels">
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
          Distribute questions according to CBSE cognitive levels:
        </p>
        {[
          { key: "easy_percent" as const, label: "Easy (Remembering & Understanding)", color: "#10b981" },
          { key: "medium_percent" as const, label: "Medium (Applying & Analysing)", color: "#f59e0b" },
          { key: "hard_percent" as const, label: "Hard (Evaluating & Creating)", color: "#ef4444" },
        ].map(({ key, label, color }) => (
          <div key={key} style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label className="label" style={{ margin: 0 }}>{label}</label>
              <span style={{ fontSize: "13px", fontWeight: 700, color }}>{form[key]}%</span>
            </div>
            <input
              type="range"
              min={0} max={100} step={5}
              value={form[key]}
              onChange={(e) => handleDifficultyChange(key, parseInt(e.target.value))}
              style={{
                accentColor: color,
              }}
            />
          </div>
        ))}
        {diffTotal !== 100 && (
          <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "8px" }}>
            Percentages must sum to exactly 100%. Current sum: {diffTotal}%
          </p>
        )}
      </FormSection>

      {/* Section 4: Reference Materials */}
      <FormSection number={4} title="Reference NCERT Textbooks, Past Papers & Syllabi">
        {/* Curated assets list */}
        {libraryAssets.length > 0 && (
          <div style={{ marginBottom: "20px", padding: "16px", borderRadius: "10px", background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Library size={16} color="#6366f1" />
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9" }}>
                Select Reference Materials from Class {form.cbse_class} Library:
              </h4>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {libraryAssets.map((asset) => {
                const isSelected = selectedAssetUrls.includes(asset.url);
                return (
                  <div
                    key={asset._id}
                    onClick={() => handleToggleAsset(asset.url)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: isSelected ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.01)",
                      border: isSelected ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(255,255,255,0.04)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSelected ? (
                      <CheckSquare size={16} color="#6366f1" style={{ flexShrink: 0 }} />
                    ) : (
                      <Square size={16} color="#64748b" style={{ flexShrink: 0 }} />
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: isSelected ? "#f1f5f9" : "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                        {asset.filename}
                      </p>
                      <span style={{ fontSize: "10px", color: "#64748b" }}>
                        {CATEGORY_LABELS[asset.category] || asset.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
          Upload additional on-the-fly reference files for this session (Optional):
        </p>
        <FileUploadZone
          onFilesUploaded={(urls) => set("document_urls", urls)}
        />
      </FormSection>

      {/* Section 5: Instructions */}
      <FormSection number={5} title="CBSE Blueprint Special Instructions">
        <textarea
          className="input-field"
          placeholder="e.g. Include choice in Section D; Add more numerical questions; Use CBSE 2024 Board pattern questions..."
          value={form.special_instructions}
          onChange={(e) => set("special_instructions", e.target.value)}
          rows={3}
          style={{ resize: "vertical" }}
        />
      </FormSection>

      {/* Submit */}
      <button
        type="submit"
        className="btn-primary"
        disabled={isLoading || diffTotal !== 100}
        style={{ width: "100%", padding: "16px", fontSize: "16px" }}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          {isLoading ? (
            <>
              <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
              Starting Generation...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate CBSE Exam Paper
            </>
          )}
        </span>
      </button>
    </form>
  );
}
