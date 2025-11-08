export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">DocuPrint</h1>
          <nav className="space-x-4">
            <a className="hover:underline" href="/signup">Resident Signup</a>
            <a className="hover:underline" href="/resident">Resident Portal</a>
            <a className="hover:underline" href="/admin">Admin</a>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-12">
        <section className="mb-10">
          <h2 className="text-3xl font-semibold mb-3">Secure, Community?Gated Document Printing</h2>
          <p className="text-zinc-600 max-w-2xl">
            Residents request access and are manually verified by their Community Admin. No passwords. OTP-only login after approval.
          </p>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/signup" className="rounded-lg border p-5 bg-white hover:shadow">
            <h3 className="font-medium mb-2">Resident Signup</h3>
            <p className="text-sm text-zinc-600">Submit your details. Await approval.</p>
          </a>
          <a href="/resident" className="rounded-lg border p-5 bg-white hover:shadow">
            <h3 className="font-medium mb-2">Resident Portal</h3>
            <p className="text-sm text-zinc-600">Login via OTP to upload and print.</p>
          </a>
          <a href="/admin" className="rounded-lg border p-5 bg-white hover:shadow">
            <h3 className="font-medium mb-2">Admin Console</h3>
            <p className="text-sm text-zinc-600">Review signups and manage print queue.</p>
          </a>
        </div>
      </main>
    </div>
  );
}
