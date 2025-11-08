import { NextRequest } from "next/server";
import { store } from "@/server/store";
import { verifySession } from "@/server/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const cookie = req.cookies.get("session")?.value;
  const sess = cookie ? verifySession(cookie) : null;
  if (!sess) return new Response("Unauthorized", { status: 401 });
  const doc = store.documentsById.get(params.id);
  if (!doc) return new Response("Not found", { status: 404 });
  // Only owner or admin can download
  if (sess.role !== "admin" && sess.sub !== doc.ownerResidentId) return new Response("Forbidden", { status: 403 });
  return new Response(doc.data, {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `attachment; filename="${doc.fileName}"`,
    },
  });
}
