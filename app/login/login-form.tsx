
"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
        setError(data.error || "Gagal masuk. Silakan periksa kembali akun kamu.");
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
      setError("Tidak dapat terhubung ke server. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      {/* LEFT PANEL */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#101F3C] lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/osis.jpeg')" }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-[#101F3C]/95 via-[#142B50]/85 to-[#0B1730]/95" />

        <div className="absolute -left-32 top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -left-20 top-44 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-48 -right-20 h-[500px] w-[500px] rounded-full border border-white/10" />

        <div className="relative z-10 flex items-center gap-3 px-14 pt-12">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
            <span className="absolute left-3 top-3 h-2 w-2 rounded-full bg-[#E9B95B]" />
            <span className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-white" />
            <span className="h-3 w-3 rounded-full border-2 border-white/80" />
          </div>

          <div>
            <p className="font-display text-xl font-bold tracking-tight text-white">
              OSIS-Hub
            </p>
            <p className="text-[10px] font-medium tracking-[0.22em] text-white/50">
              ORGANIZATION MANAGEMENT
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-[620px] px-14 pb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#E9B95B]" />
            <span className="text-[11px] font-semibold tracking-[0.16em] text-white/80">
              DIGITAL ORGANIZATION PLATFORM
            </span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.15] tracking-tight text-white xl:text-[58px]">
            Satu ruang.
            <br />
            Banyak <span className="text-[#E9B95B]">kontribusi.</span>
          </h1>

          <p className="mt-6 max-w-[460px] text-[15px] leading-8 text-white/65">
            Menghubungkan pengurus, anggota, dan seluruh elemen organisasi
            dalam satu ekosistem digital yang terintegrasi.
          </p>

          <div className="mt-12 flex flex-wrap gap-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#E9B95B]">
                <Users size={19} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Kolaborasi</p>
                <p className="mt-0.5 text-[11px] text-white/45">Satu organisasi</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#E9B95B]">
                <ShieldCheck size={19} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Terintegrasi</p>
                <p className="mt-0.5 text-[11px] text-white/45">Satu sistem</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between px-14 pb-9 text-[11px] text-white/40">
          <span>OSIS-Hub © {new Date().getFullYear()}</span>
          <span>Built for better organizations.</span>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="flex min-h-screen flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[420px]">
          {/* MOBILE BRAND */}
          <a href="/" className="mb-14 flex items-center gap-3 lg:hidden">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2859A5] to-[#142B50]">
              <span className="absolute left-2.5 top-2.5 h-2 w-2 rounded-full bg-[#E9B95B]" />
              <span className="absolute bottom-2.5 right-2.5 h-2 w-2 rounded-full bg-white" />
              <span className="h-3 w-3 rounded-full border-2 border-white" />
            </div>
            <span className="font-display text-xl font-bold text-[#142B50]">
              OSIS-Hub
            </span>
          </a>

          <div className="mb-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF3FC] text-[#2859A5]">
              <ShieldCheck size={24} strokeWidth={1.8} />
            </div>

            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#2859A5]">
              Welcome Back
            </p>

            <h2 className="font-display text-[30px] font-bold tracking-tight text-[#142B50] sm:text-[34px]">
              Selamat datang
              <br />
              kembali.
            </h2>

            <p className="mt-3 text-[14px] leading-7 text-[#78869B]">
              Masuk ke akun OSIS-Hub untuk melanjutkan aktivitas organisasi
              kamu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* USERNAME */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-[13px] font-semibold text-[#263B59]"
              >
                Username
              </label>

              <div className="group relative">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA8BA] transition group-focus-within:text-[#2859A5]"
                />

                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/\s/g, ""))
                  }
                  pattern="^[a-zA-Z0-9_]+$"
                  title="Username tidak boleh mengandung spasi. Gunakan underscore (_) untuk memisahkan kata."
                  placeholder="Masukkan username"
                  className="h-[52px] w-full rounded-xl border border-[#E4EAF2] bg-[#F8FAFD] pl-11 pr-4 text-[14px] text-[#263B59] outline-none transition placeholder:text-[#AAB5C4] hover:border-[#C8D5E7] focus:border-[#2859A5] focus:bg-white focus:ring-4 focus:ring-[#2859A5]/10"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[13px] font-semibold text-[#263B59]"
                >
                  Password
                </label>
              </div>

              <div className="group relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA8BA] transition group-focus-within:text-[#2859A5]"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="h-[52px] w-full rounded-xl border border-[#E4EAF2] bg-[#F8FAFD] pl-11 pr-12 text-[14px] text-[#263B59] outline-none transition placeholder:text-[#AAB5C4] hover:border-[#C8D5E7] focus:border-[#2859A5] focus:bg-white focus:ring-4 focus:ring-[#2859A5]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA8BA] transition hover:text-[#2859A5]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] leading-5 text-red-600"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-3 flex h-[53px] w-full items-center justify-center gap-2 rounded-xl bg-[#142B50] px-5 text-[14px] font-semibold text-white shadow-lg shadow-[#142B50]/15 transition hover:-translate-y-0.5 hover:bg-[#2859A5] hover:shadow-xl hover:shadow-[#2859A5]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk ke OSIS-Hub
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-9 flex items-start gap-3 rounded-xl border border-[#E9EEF5] bg-[#F8FAFD] p-4">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#2859A5]"
            />
            <p className="text-[11px] leading-5 text-[#8290A3]">
              Akun diberikan oleh pengurus OSIS sekolah. Pastikan kamu
              menggunakan akun yang sesuai dengan hak akses masing-masing.
            </p>
          </div>

          <div className="mt-10 text-center text-[11px] text-[#A0AABB]">
            © {new Date().getFullYear()} OSIS-Hub. All rights reserved.
          </div>
        </div>
      </section>
    </main>
  );
}
