"use client";
import { useEffect, useState } from "react";

type DocItem = {
  id: string;
  fileName: string;
  sizeBytes: number;
  status: string;
  createdAt: number;
};

export default function ResidentPage() {
  const [mobile, setMobile] = useState("");
  const [step, setStep] = useState<"login" | "verify" | "portal">("login");
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [uploading, setUploading] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/request-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mobile }) });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to request OTP");
      return;
    }
    setDevCode(data.devCode || null);
    setStep("verify");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mobile, code: otp }) });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Invalid code");
      return;
    }
    setStep("portal");
    await loadDocs();
  }

  async function loadDocs() {
    const res = await fetch("/api/docs/list");
    const data = await res.json();
    if (res.ok) setDocs(data.items);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/docs/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    await loadDocs();
  }

  useEffect(() => {
    // try loading docs to detect an existing session
    loadDocs().then(() => setStep("portal")).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (step !== "portal") {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Resident Login</h1>
        {error && <div className="mb-4 rounded bg-red-50 text-red-800 p-3">{error}</div>}
        {step === "login" && (
          <form onSubmit={requestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mobile (10 digits)</label>
              <input className="w-full border rounded px-3 py-2" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} required />
            </div>
            <button className="bg-black text-white px-4 py-2 rounded" type="submit">Request OTP</button>
          </form>
        )}
        {step === "verify" && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Enter OTP</label>
              <input className="w-full border rounded px-3 py-2 tracking-widest" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} required />
            </div>
            {devCode && (
              <div className="text-xs text-zinc-600">Dev code: <span className="font-mono">{devCode}</span></div>
            )}
            <button className="bg-black text-white px-4 py-2 rounded" type="submit">Verify</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Resident Portal</h1>
      {error && <div className="mb-4 rounded bg-red-50 text-red-800 p-3">{error}</div>}
      <div className="mb-6 p-4 border rounded bg-white">
        <label className="block text-sm font-medium mb-2">Upload document (PDF/Image, max 2MB)</label>
        <input type="file" accept="application/pdf,image/*" onChange={onUpload} />
        {uploading && <div className="text-sm text-zinc-600 mt-2">Uploading...</div>}
      </div>
      <div>
        <h2 className="text-lg font-medium mb-3">My Documents</h2>
        {docs.length === 0 ? (
          <div className="text-sm text-zinc-600">No documents yet.</div>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between border rounded p-3 bg-white">
                <div>
                  <div className="font-medium">{d.fileName}</div>
                  <div className="text-xs text-zinc-600">{(d.sizeBytes / 1024).toFixed(1)} KB ? {d.status}</div>
                </div>
                <a className="text-sm text-blue-600 hover:underline" href={`/api/docs/${d.id}/download`}>Download</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
