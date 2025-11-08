import { NextRequest, NextResponse } from "next/server";
import { store } from "@/server/store";
import { verifySession } from "@/server/auth";

function requireAdmin(req: NextRequest) {
  const cookie = req.cookies.get("session")?.value;
  const sess = cookie ? verifySession(cookie) : null;
  if (!sess || sess.role !== "admin") return null;
  return sess;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const resident = store.approveSignup(params.id);
  if (!resident) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  console.log(`[DocuPrint] Approved resident ${resident.fullName} (${resident.mobile})`);
  return NextResponse.json({ ok: true, resident });
}
