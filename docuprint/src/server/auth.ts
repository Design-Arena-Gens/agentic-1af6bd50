import { cookies } from "next/headers";
import { createHmac, randomInt } from "crypto";
import type { Resident } from "../server/store";
import { store } from "../server/store";

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-not-secure";
const ADMIN_ACCESS_TOKEN = process.env.ADMIN_ACCESS_TOKEN || "admin123";

export type Session = {
  sub: string; // residentId or "admin"
  role: "resident" | "admin";
  mobile?: string;
  name?: string;
  iat: number;
  exp: number;
};

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function signSession(session: Session) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify(session));
  const data = `${header}.${payload}`;
  const sig = createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifySession(token: string): Session | null {
  try {
    const [h, p, sig] = token.split(".");
    const data = `${h}.${p}`;
    const expected = createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
    if (sig !== expected) return null;
    const session = JSON.parse(Buffer.from(p, "base64").toString()) as Session;
    if (Date.now() / 1000 > session.exp) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(session: Session) {
  const token = signSession(session);
  return token;
}

export function isAdminTokenValid(input: string) {
  return input === ADMIN_ACCESS_TOKEN;
}

export function generateOtpCode(): string {
  const n = randomInt(0, 1000000);
  return n.toString().padStart(6, "0");
}

export function devMode() {
  return process.env.NEXT_PUBLIC_DEV_MODE === "true" || process.env.NODE_ENV !== "production";
}

export function findResidentByMobile(mobile: string): Resident | null {
  return store.findResidentByMobile(mobile);
}
