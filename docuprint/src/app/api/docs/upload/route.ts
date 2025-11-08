import { NextRequest, NextResponse } from "next/server";
import { store } from "@/server/store";
import { verifySession } from "@/server/auth";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("session")?.value;
  const sess = cookie ? verifySession(cookie) : null;
  if (!sess || sess.role !== "resident") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > 2 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "File too large (max 2MB)" }, { status: 413 });
  }
  const doc = store.addDocument({
    ownerResidentId: sess.sub,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: bytes.length,
    data: bytes,
  });
  return NextResponse.json({ ok: true, document: { id: doc.id, fileName: doc.fileName, status: doc.status } });
}
