import { NextRequest, NextResponse } from "next/server";
import { store } from "@/server/store";
import { verifySession } from "@/server/auth";

function requireAdmin(req: NextRequest) {
  const cookie = req.cookies.get("session")?.value;
  const sess = cookie ? verifySession(cookie) : null;
  if (!sess || sess.role !== "admin") return null;
  return sess;
}

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as any;
  const community = searchParams.get("community") || undefined;
  const list = store.listSignupRequests({ status, community });
  return NextResponse.json({ ok: true, items: list });
}
