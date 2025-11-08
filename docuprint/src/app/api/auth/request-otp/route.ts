import { NextRequest, NextResponse } from "next/server";
import { store } from "@/server/store";
import { devMode, findResidentByMobile, generateOtpCode } from "@/server/auth";

export async function POST(req: NextRequest) {
  const { mobile } = await req.json().catch(() => ({ mobile: "" }));
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return NextResponse.json({ ok: false, error: "Invalid mobile" }, { status: 400 });
  }
  const resident = findResidentByMobile(mobile);
  if (!resident) {
    return NextResponse.json({ ok: false, error: "Mobile not approved" }, { status: 403 });
  }
  const code = generateOtpCode();
  store.setOtpSession(mobile, code, 5 * 60 * 1000);
  console.log(`[DocuPrint] OTP for ${mobile}: ${code}`);
  return NextResponse.json({ ok: true, devCode: devMode() ? code : undefined });
}
