import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Basic security check: ensure we are only proxying Vercel Blob URLs
  if (!url.includes("blob.vercel-storage.com")) {
    return new NextResponse("Invalid blob URL", { status: 400 });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const headers: HeadersInit = {};
    
    // Add the Vercel Blob token so we can read private blobs
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });
    
    if (!res.ok) {
      return new NextResponse(`Failed to fetch blob: ${res.statusText}`, { status: res.status });
    }

    // Proxy the response headers to the client (Content-Type, Content-Disposition, etc.)
    const newHeaders = new Headers();
    const contentType = res.headers.get("content-type");
    const contentDisposition = res.headers.get("content-disposition");
    const contentLength = res.headers.get("content-length");
    
    if (contentType) newHeaders.set("Content-Type", contentType);
    if (contentDisposition) newHeaders.set("Content-Disposition", contentDisposition);
    if (contentLength) newHeaders.set("Content-Length", contentLength);

    return new NextResponse(res.body, { headers: newHeaders });
  } catch (err) {
    console.error("Error proxying blob:", err);
    return new NextResponse("Error proxying blob download", { status: 500 });
  }
}
