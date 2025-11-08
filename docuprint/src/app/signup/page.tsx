"use client";
import { useMemo, useState } from "react";
import { STATES } from "@/data/locations";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [stateName, setStateName] = useState("");
  const [cityName, setCityName] = useState("");
  const [community, setCommunity] = useState("");
  const [block, setBlock] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const cities = useMemo(() => {
    const s = STATES.find((x) => x.name === stateName);
    return s ? s.cities : [];
  }, [stateName]);

  const communities = useMemo(() => {
    const c = cities.find((x) => x.name === cityName);
    return c ? c.communities : [];
  }, [cities, cityName]);

  const blocks = useMemo(() => {
    const com = communities.find((x) => x.name === community);
    return com ? com.blocks : [];
  }, [communities, community]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setStatus(null);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, mobile, state: stateName, city: cityName, community, block, flatNumber }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrors(data.errors || ["Unknown error"]);
    } else {
      setStatus("Request submitted. Await admin approval.");
      setFullName("");
      setMobile("");
      setStateName("");
      setCityName("");
      setCommunity("");
      setBlock("");
      setFlatNumber("");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Resident Signup</h1>
      <p className="text-sm text-gray-600 mb-6">Gated access. Admin approval is required. No password; OTP login after approval.</p>
      {status && <div className="mb-4 rounded bg-green-50 text-green-800 p-3">{status}</div>}
      {errors.length > 0 && (
        <div className="mb-4 rounded bg-red-50 text-red-800 p-3">
          <ul className="list-disc pl-6">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input className="w-full border rounded px-3 py-2" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mobile (10 digits)</label>
          <input className="w-full border rounded px-3 py-2" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <select className="w-full border rounded px-3 py-2" value={stateName} onChange={(e) => { setStateName(e.target.value); setCityName(""); setCommunity(""); setBlock(""); }} required>
              <option value="">Select State</option>
              {STATES.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <select className="w-full border rounded px-3 py-2" value={cityName} onChange={(e) => { setCityName(e.target.value); setCommunity(""); setBlock(""); }} required disabled={!stateName}>
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Community</label>
            <select className="w-full border rounded px-3 py-2" value={community} onChange={(e) => { setCommunity(e.target.value); setBlock(""); }} required disabled={!cityName}>
              <option value="">Select Community</option>
              {communities.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Block</label>
            <select className="w-full border rounded px-3 py-2" value={block} onChange={(e) => setBlock(e.target.value)} required disabled={!community}>
              <option value="">Select Block</option>
              {blocks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Flat Number</label>
            <input className="w-full border rounded px-3 py-2" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} required />
          </div>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded" type="submit">Submit</button>
      </form>
    </div>
  );
}
