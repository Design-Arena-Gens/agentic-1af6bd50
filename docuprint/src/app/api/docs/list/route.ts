import { NextRequest, NextResponse } from "next/server";
import { store } from "@/server/store";
import { verifySession } from "@/server/auth";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("session")?.value;
  const sess = cookie ? verifySession(cookie) : null;
  if (!sess || sess.role !== "resident") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const docs = store.listDocumentsForResident(sess.sub);
  return NextResponse.json({ ok: true, items: docs.map(d => ({ id: d.id, fileName: d.fileName, sizeBytes: d.sizeBytes, status: d.status, createdAt: d.createdAt })) });
}
