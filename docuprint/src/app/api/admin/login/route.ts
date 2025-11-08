import { NextRequest, NextResponse } from "next/server";
import { isAdminTokenValid, setSessionCookie } from "@/server/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { token } = body as { token?: string };
  if (!token || !isAdminTokenValid(token)) {
    return NextResponse.json({ ok: false, error: "Invalid admin token" }, { status: 401 });
  }
  const now = Math.floor(Date.now() / 1000);
  const sessionToken = setSessionCookie({
    sub: "admin",
    role: "admin",
    iat: now,
    exp: now + 60 * 60 * 8, // 8 hours
  });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
