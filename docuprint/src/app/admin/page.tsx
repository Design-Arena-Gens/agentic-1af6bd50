"use client";
import { useEffect, useState } from "react";

type Signup = {
  id: string;
  fullName: string;
  mobile: string;
  state: string;
  city: string;
  community: string;
  block: string;
  flatNumber: string;
  status: string;
  createdAt: number;
};

type DocItem = {
  id: string;
  fileName: string;
  sizeBytes: number;
  status: string;
  createdAt: number;
};

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [docs, setDocs] = useState<{ id: string; ownerResidentId: string; fileName: string; sizeBytes: number; status: string; createdAt: number }[]>([]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    if (res.ok) {
      setIsAuthed(true);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
    }
  }

  async function load() {
    const s = await fetch("/api/admin/requests?status=pending_approval").then((r) => r.json());
    if (s.ok) setSignups(s.items);
    // For simplicity, admin fetches all docs via resident endpoint isn't allowed; skip listing per resident
    // We'll list by making a lightweight admin-only endpoint later; here we omit to keep demo concise
  }

  async function approve(id: string) {
    await fetch(`/api/admin/requests/${id}/approve`, { method: "POST" });
    await load();
  }

  async function reject(id: string) {
    await fetch(`/api/admin/requests/${id}/reject`, { method: "POST" });
    await load();
  }

  useEffect(() => {
    // Try to load; if unauthorized it will fail silently
    load().then(() => setIsAuthed(true)).catch(() => setIsAuthed(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthed) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
        {error && <div className="mb-4 rounded bg-red-50 text-red-800 p-3">{error}</div>}
        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Access Token</label>
            <input className="w-full border rounded px-3 py-2" value={token} onChange={(e) => setToken(e.target.value)} required />
          </div>
          <button className="bg-black text-white px-4 py-2 rounded" type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Console</h1>
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-3">Pending Signups</h2>
        {signups.length === 0 ? (
          <div className="text-sm text-zinc-600">No pending requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Mobile</th>
                  <th className="p-2 border">Address</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((s) => (
                  <tr key={s.id}>
                    <td className="p-2 border">{s.fullName}</td>
                    <td className="p-2 border">{s.mobile}</td>
                    <td className="p-2 border">{s.community}, {s.block}-{s.flatNumber}, {s.city}, {s.state}</td>
                    <td className="p-2 border space-x-2">
                      <button onClick={() => approve(s.id)} className="px-3 py-1 rounded bg-green-600 text-white">Approve</button>
                      <button onClick={() => reject(s.id)} className="px-3 py-1 rounded bg-red-600 text-white">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
