import { NextRequest, NextResponse } from "next/server";
import { store } from "@/server/store";
import { setSessionCookie } from "@/server/auth";

export async function POST(req: NextRequest) {
  const { mobile, code } = await req.json().catch(() => ({ mobile: "", code: "" }));
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return NextResponse.json({ ok: false, error: "Invalid mobile" }, { status: 400 });
  }
  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, error: "Invalid code" }, { status: 400 });
  }
  const ok = store.verifyOtp(mobile, code);
  if (!ok) return NextResponse.json({ ok: false, error: "Invalid or expired code" }, { status: 401 });
  const resident = store.findResidentByMobile(mobile);
  if (!resident) return NextResponse.json({ ok: false, error: "Not approved" }, { status: 403 });
  const now = Math.floor(Date.now() / 1000);
  const token = setSessionCookie({
    sub: resident.id,
    role: "resident",
    mobile: resident.mobile,
    name: resident.fullName,
    iat: now,
    exp: now + 60 * 60 * 8,
  });
  const res = NextResponse.json({ ok: true, resident: { id: resident.id, name: resident.fullName } });
  res.cookies.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
