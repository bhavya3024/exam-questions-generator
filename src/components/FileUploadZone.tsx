"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface UploadedFile {
  name: string;
  size: number;
  url: string;
  status: "uploading" | "done" | "error";
}

interface FileUploadZoneProps {
  onFilesUploaded: (urls: string[]) => void;
}

export default function FileUploadZone({ onFilesUploaded }: FileUploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Attempt Vercel Blob Client upload (bypasses 4.5MB serverless limit)
      const { upload } = await import("@vercel/blob/client");
      const blob = await upload(file.name, file, {
        access: "private",
        handleUploadUrl: "/api/upload",
      });
      return blob.url;
    } catch (err) {
      // Fallback to standard FormData (for local Mock Storage or missing Vercel config)
      console.log("Blob client upload failed, falling back to local mock upload");
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const errRes = await res.json();
          throw new Error(errRes.error || "Upload failed");
        }
        const data = await res.json();
        return data.url;
      } catch (fallbackErr: unknown) {
        const msg = fallbackErr instanceof Error ? fallbackErr.message : "Upload failed";
        toast.error(`Failed to upload ${file.name}: ${msg}`);
        return null;
      }
    }
  };

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const newFiles: UploadedFile[] = accepted.map((f) => ({
        name: f.name,
        size: f.size,
        url: "",
        status: "uploading",
      }));
      setFiles((prev) => [...prev, ...newFiles]);

      const uploadedUrls: string[] = [];
      await Promise.all(
        accepted.map(async (file, i) => {
          const url = await uploadFile(file);
          setFiles((prev) =>
            prev.map((f, j) =>
              f.name === file.name && f.status === "uploading"
                ? { ...f, url: url || "", status: url ? "done" : "error" }
                : f
            )
          );
          if (url) uploadedUrls.push(url);
        })
      );

      if (uploadedUrls.length) {
        onFilesUploaded(uploadedUrls);
        toast.success(`${uploadedUrls.length} file(s) uploaded successfully!`);
      }
    },
    [onFilesUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxSize: 50 * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    // Notify parent to remove the URL
    onFilesUploaded(
      files
        .filter((f) => f.name !== name && f.status === "done")
        .map((f) => f.url)
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`drop-zone ${isDragActive ? "drag-over" : ""}`}
      >
        <input {...getInputProps()} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={24} color="#6366f1" />
          </div>
          <div>
            <p style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: "4px", fontSize: "15px" }}>
              {isDragActive ? "Drop files here..." : "Drag & drop files here"}
            </p>
            <p style={{ color: "#64748b", fontSize: "13px" }}>
              PDF or TXT · Max 50MB per file
            </p>
          </div>
          <button
            type="button"
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#6366f1",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Browse files
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {files.map((file) => (
            <div
              key={file.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(13,27,62,0.6)",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <File size={16} color="#6366f1" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {file.name}
                </p>
                <p style={{ fontSize: "11px", color: "#64748b" }}>{formatSize(file.size)}</p>
              </div>
              {file.status === "uploading" && (
                <Loader2 size={16} color="#6366f1" style={{ flexShrink: 0, animation: "spin-slow 1s linear infinite" }} />
              )}
              {file.status === "done" && (
                <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0 }} />
              )}
              {file.status === "error" && (
                <span style={{ fontSize: "11px", color: "#ef4444" }}>Failed</span>
              )}
              <button
                type="button"
                onClick={() => removeFile(file.name)}
                style={{ padding: "2px", cursor: "pointer", background: "none", border: "none", color: "#64748b", flexShrink: 0 }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
