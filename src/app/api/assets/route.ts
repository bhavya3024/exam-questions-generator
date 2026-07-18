import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/assets — fetch files filtered by class and subject
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cbse_class = searchParams.get("cbse_class");
    const subject = searchParams.get("subject");
    const category = searchParams.get("category"); // optional: textbook | past_paper | syllabus | blueprint

    const query: any = {};
    if (cbse_class) query.cbse_class = cbse_class;
    if (subject) query.subject = subject;
    if (category) query.category = category;

    const db = await getDb();
    const assets = await db
      .collection("curriculum_assets")
      .find(query)
      .sort({ uploaded_at: -1 })
      .toArray();

    return NextResponse.json({ assets });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch curriculum assets";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/assets — save curriculum asset details after file upload
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cbse_class, subject, category, filename, url, size_bytes } = body;

    if (!cbse_class || !subject || !category || !filename || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();
    const doc = {
      cbse_class,
      subject,
      category,
      filename,
      url,
      size_bytes: size_bytes || 0,
      uploaded_at: new Date().toISOString(),
    };

    const result = await db.collection("curriculum_assets").insertOne(doc);

    return NextResponse.json({
      success: true,
      asset_id: result.insertedId,
      asset: doc,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save curriculum asset";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/assets — delete an asset by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing asset ID" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db
      .collection("curriculum_assets")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete asset";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
