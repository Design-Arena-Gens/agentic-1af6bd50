import { NextRequest, NextResponse } from "next/server";
import { store } from "@/server/store";
import { verifySession } from "@/server/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const cookie = req.cookies.get("session")?.value;
  const sess = cookie ? verifySession(cookie) : null;
  if (!sess || sess.role !== "admin") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const ok = store.markPrinted(params.id);
  if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
