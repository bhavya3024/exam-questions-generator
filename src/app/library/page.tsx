"use client";
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { BookOpen, FileText, Upload, Trash2, ShieldAlert, Award, File, Plus, HelpCircle, Layers, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const CBSE_CLASSES = {
  "9": "Class IX (Secondary)",
  "10": "Class X (Secondary - Board)",
  "11": "Class XI (Senior Secondary)",
  "12": "Class XII (Senior Secondary - Board)",
};

const CBSE_SUBJECTS: Record<string, string[]> = {
  "9": ["Mathematics", "Science", "Social Science", "English Language and Literature", "Hindi", "Information Technology"],
  "10": ["Mathematics (Standard)", "Mathematics (Basic)", "Science", "Social Science", "English Language and Literature", "Hindi Course A", "Hindi Course B", "Computer Applications", "Information Technology"],
  "11": ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science (Python)", "English Core", "Hindi Core", "Economics", "Business Studies", "Accountancy", "Political Science", "History", "Geography", "Physical Education", "Psychology"],
  "12": ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science (Python)", "English Core", "Hindi Core", "Economics", "Business Studies", "Accountancy", "Political Science", "History", "Geography", "Physical Education", "Psychology"],
};

const CATEGORIES = [
  { id: "textbook", label: "Standard Textbook", desc: "Official curriculum chapters or textbooks", color: "#6366f1" },
  { id: "past_paper", label: "Past Board Paper", desc: "Previous years' CBSE board papers", color: "#8b5cf6" },
  { id: "syllabus", label: "Curriculum Syllabus", desc: "CBSE curriculum/syllabus files", color: "#06b6d4" },
  { id: "blueprint", label: "Design Blueprint", desc: "Marking scheme & chapter-weightage maps", color: "#10b981" },
];

interface Asset {
  _id: string;
  cbse_class: string;
  subject: string;
  category: string;
  filename: string;
  url: string;
  size_bytes: number;
  uploaded_at: string;
  graph?: {
    nodes: any[];
    relationships: any[];
  };
  graph_extracted_at?: string;
}

export default function LibraryPage() {
  const [selectedClass, setSelectedClass] = useState<string>("10");
  const [selectedSubject, setSelectedSubject] = useState<string>("Science");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  // Sync subject dropdown when class changes
  useEffect(() => {
    const subjects = CBSE_SUBJECTS[selectedClass] || [];
    if (!subjects.includes(selectedSubject)) {
      setSelectedSubject(subjects[0] || "");
    }
  }, [selectedClass]);

  // Load assets matching Class & Subject
  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets?cbse_class=${selectedClass}&subject=${encodeURIComponent(selectedSubject)}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.error("Failed to load curriculum assets", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [selectedClass, selectedSubject]);

  // Handle asset deletion
  const handleDelete = async (id: string, filename: string) => {
    const toastId = toast.loading(`Deleting ${filename}...`);
    try {
      const res = await fetch(`/api/assets?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("File deleted successfully!", { id: toastId });
        loadAssets();
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete reference file", { id: toastId });
    }
  };

  // Upload handler for category specific uploads
  const handleUpload = async (file: File, category: string) => {
    setUploadingCategory(category);
    const toastId = toast.loading(`Uploading ${file.name} to ${category}...`);
    
    let uploadUrl = "";
    try {
      try {
        // Attempt Vercel Blob Client upload
        const { upload } = await import("@vercel/blob/client");
        const blob = await upload(file.name, file, {
          access: "private",
          handleUploadUrl: "/api/upload",
        });
        uploadUrl = blob.url;
      } catch (err) {
        // Fallback for mock local storage
        console.log("Blob client upload failed, falling back to local mock upload");
        const formData = new FormData();
        formData.append("file", file);
        const resUpload = await fetch("/api/upload", { method: "POST", body: formData });
        if (!resUpload.ok) {
          const errRes = await resUpload.json();
          throw new Error(errRes.error || "Upload failed");
        }
        const uploadData = await resUpload.json();
        uploadUrl = uploadData.url;
      }

      const resMeta = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cbse_class: selectedClass,
          subject: selectedSubject,
          category,
          filename: file.name,
          url: uploadUrl,
          size_bytes: file.size,
        }),
      });

      if (!resMeta.ok) {
        throw new Error("Failed to save reference details");
      }
      
      const metaData = await resMeta.json();

      toast.success(`${file.name} uploaded successfully!`, { id: toastId });
      
      
      loadAssets();
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploadingCategory(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 80px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", marginBottom: "40px", flexWrap: "wrap" }}>
        <div>
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
            <BookOpen size={13} color="#6366f1" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#6366f1" }}>CBSE Material Manager</span>
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
            Reference Curriculum Library
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "600px" }}>
            Upload syllabus blueprints, past papers, standard books, and design guides categorized by standard classes. The generator will pull context from here.
          </p>
        </div>

        {/* Selection bar */}
        <div className="glass" style={{ display: "flex", gap: "12px", padding: "12px 18px", alignItems: "center" }}>
          <div>
            <label className="label" style={{ fontSize: "11px", marginBottom: "4px" }}>CBSE Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field"
              style={{ width: "160px", padding: "8px 12px" }}
            >
              {Object.entries(CBSE_CLASSES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" style={{ fontSize: "11px", marginBottom: "4px" }}>Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field"
              style={{ width: "200px", padding: "8px 12px" }}
            >
              {(CBSE_SUBJECTS[selectedClass] || []).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of upload categories */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        {CATEGORIES.map((cat) => {
          const categoryAssets = assets.filter((a) => a.category === cat.id);
          const isUploading = uploadingCategory === cat.id;

          return (
            <div key={cat.id} className="glass" style={{ padding: "24px", display: "flex", flexDirection: "column", minHeight: "420px" }}>
              {/* Category Header */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: `${cat.color}15`,
                    border: `1px solid ${cat.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={18} color={cat.color} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "15px", color: "#f1f5f9" }}>{cat.label}</h3>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>{cat.desc}</span>
                </div>
              </div>

              {/* Upload Drop Zone wrapper */}
              <CategoryUploadZone
                category={cat.id}
                color={cat.color}
                onUpload={(file) => handleUpload(file, cat.id)}
                isUploading={isUploading}
              />

              {/* Uploaded File List */}
              <div style={{ flex: 1, marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto", paddingRight: "4px" }} className="scroll-area">
                {isLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="skeleton"
                        style={{
                          height: "36px",
                          width: "100%",
                          borderRadius: "8px"
                        }}
                      />
                    ))}
                  </div>
                ) : categoryAssets.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(255,255,255,0.03)", borderRadius: "10px", padding: "20px", opacity: 0.5 }}>
                    <File size={20} color="#475569" style={{ marginBottom: "6px" }} />
                    <span style={{ fontSize: "12px", color: "#64748b" }}>No files reference</span>
                  </div>
                ) : (
                  categoryAssets.map((asset) => (
                    <div
                      key={asset._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.01)",
                        border: "1px solid rgba(99,102,241,0.08)",
                      }}
                    >
                      <File size={14} color="#6366f1" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#f1f5f9",
                            textDecoration: "none",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}
                          className="hover:underline"
                        >
                          {asset.filename}
                        </a>
                        <span style={{ fontSize: "10px", color: "#64748b" }}>{formatSize(asset.size_bytes)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          onClick={() => handleDelete(asset._id, asset.filename)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: "4px",
                            color: "#64748b",
                            cursor: "pointer",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// Category Specific File Dropzone helper component
interface CatProps {
  category: string;
  color: string;
  onUpload: (file: File) => void;
  isUploading: boolean;
}

function CategoryUploadZone({ category, color, onUpload, isUploading }: CatProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => onUpload(file));
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxSize: 50 * 1024 * 1024,
    multiple: true,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: `1px dashed ${isDragActive ? color : "rgba(99,102,241,0.2)"}`,
        background: isDragActive ? `${color}05` : "rgba(5, 8, 22, 0.4)",
        borderRadius: "12px",
        padding: "16px",
        textAlign: "center",
        cursor: isUploading ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
      }}
      className="hover:border-indigo-500 hover:bg-slate-900/10"
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: color, borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
          <span style={{ fontSize: "11px", color: "#64748b" }}>Uploading files...</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <Upload size={14} color={color} />
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            {isDragActive ? "Drop here" : "Upload Files"}
          </span>
          <span style={{ fontSize: "9px", color: "#475569" }}>PDF or TXT, Max 50MB</span>
        </div>
      )}
    </div>
  );
}
