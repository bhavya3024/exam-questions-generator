import { put } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const isMockMode = !token || token.startsWith("vercel_blob_rw_xxxx");

    // 1. Check if this is a Vercel Blob client upload request (JSON)
    if (request.headers.get("content-type")?.includes("application/json")) {
      if (isMockMode) {
        // If there's no valid token, Vercel Blob client upload cannot work.
        // Calling handleUpload here would generate a dev URL that causes CORS errors on production.
        return NextResponse.json({ error: "Vercel Blob token is missing. Please configure Vercel Blob Storage in your project." }, { status: 400 });
      }
      
      const body = (await request.json()) as HandleUploadBody;
      try {
        const jsonResponse = await handleUpload({
          body,
          request,
          onBeforeGenerateToken: async (pathname) => {
            return {
              maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB
              tokenPayload: JSON.stringify({}),
            };
          },
          onUploadCompleted: async ({ blob }) => {
            // Optionally notify agent to save metadata
            try {
              const agentUrl = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8000";
              await fetch(`${agentUrl}/upload-metadata`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  blob_url: blob.url,
                  filename: blob.pathname,
                  file_type: blob.contentType,
                  size_bytes: 0,
                }),
              });
            } catch {
              // Non-critical — agent metadata save failure should not block upload
            }
          },
        });
        return NextResponse.json(jsonResponse);
      } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 400 });
      }
    }

    // 2. Fallback: handle standard FormData upload (for mock mode or browsers lacking support)
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = 500 * 1024 * 1024; // 500 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 500MB)" }, { status: 413 });
    }

    const allowedTypes = ["application/pdf", "text/plain", "text/markdown"];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF and TXT files are supported" }, { status: 415 });
    }



    let fileUrl = "";
    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    if (isMockMode) {
      console.log("⚠️ No Vercel Blob Token found. Operating in local mock storage mode.");
      
      // Define path to save files locally
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      // Ensure the directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, safeFilename);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Write file locally
      fs.writeFileSync(filePath, buffer);
      
      // Build local URL
      const host = request.headers.get("host") || "localhost:3000";
      const protocol = request.nextUrl.protocol || "http:";
      fileUrl = `${protocol}//${host}/uploads/${safeFilename}`;
      
      console.log(`📝 Mock uploaded file saved to: ${filePath}`);
      console.log(`🔗 Mock file available at: ${fileUrl}`);
    } else {
      // Use standard Vercel Blob storage (if token exists but client upload was not used)
      const blob = await put(`exam-docs/${safeFilename}`, file, {
        access: "private",
        token: token,
      });
      fileUrl = blob.url;
    }

    // Optionally notify agent to save metadata for fallback upload
    try {
      const agentUrl = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8000";
      await fetch(`${agentUrl}/upload-metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blob_url: fileUrl,
          filename: file.name,
          file_type: file.type,
          size_bytes: file.size,
        }),
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      url: fileUrl,
      filename: file.name,
      size: file.size,
      mock: isMockMode
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    console.error("Upload error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
