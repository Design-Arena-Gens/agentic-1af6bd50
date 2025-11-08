import { NextRequest, NextResponse } from "next/server";
import { store } from "@/server/store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fullName, mobile, state, city, community, block, flatNumber } = body || {};

  const errors: string[] = [];
  if (!fullName || typeof fullName !== "string") errors.push("fullName is required");
  if (!mobile || !/^\d{10}$/.test(mobile)) errors.push("mobile must be 10 digits");
  for (const [k, v] of Object.entries({ state, city, community, block, flatNumber })) {
    if (!v || typeof v !== "string") errors.push(`${k} is required`);
  }

  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });

  const record = store.createSignup({ fullName, mobile, state, city, community, block, flatNumber });

  // In a real system, notify community admin via email + in-app
  console.log(`[DocuPrint] New signup request: ${record.fullName} (${record.mobile}) for ${record.community}`);

  return NextResponse.json({ ok: true, id: record.id });
}
