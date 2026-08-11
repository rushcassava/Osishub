"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal masuk. Coba lagi.");
        setLoading(false);
        return;
      }

      let next = searchParams.get("next");
      if (next && (!next.startsWith("/") || next.startsWith("//"))) {
        next = null;
      }
      router.push(next || data.redirectTo || "/dashboard");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6"
      style={{
        backgroundImage: "url('/osis.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/45 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-[400px]">
        <a href="/" className="mb-10 flex items-center justify-center gap-2.5 font-display text-[19px] font-bold">
          <span className="relative block h-[34px] w-[34px] rounded-[9px] bg-gradient-to-br from-blue to-navy">
            <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          OSIS-Hub
        </a>

        <div className="rounded-[16px] border border-line bg-panel p-9 shadow-card">
          <h1 className="mb-1.5 font-display text-[22px] font-bold text-navy">Masuk ke akun kamu</h1>
          <p className="mb-7 text-[14px] text-inkSoft">
            Gunakan akun yang diberikan oleh pengurus OSIS sekolahmu.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-[13px] font-medium text-ink">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-[9px] border border-line bg-bg px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-blue focus:bg-white"
                placeholder="mis. anggota01"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[9px] border border-line bg-bg px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-blue focus:bg-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-[8px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-[9px] bg-navy px-5 py-3 text-[14.5px] font-semibold text-white transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        <p className="mt-6 rounded-[10px] border border-line bg-white/60 p-4 text-center text-[12.5px] text-inkFaint">
          Akun demo (setelah <code className="font-mono">npm run db:seed</code>):
          <br />
          <span className="font-mono text-ink">anggota01</span> /{" "}
          <span className="font-mono text-ink">perwakilan01</span> /{" "}
          <span className="font-mono text-ink">pengurus01</span> — password:{" "}
          <span className="font-mono text-ink">password123</span>
        </p>
      </div>
    </div>
  );
}
