import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const roleModules: Record<string, { title: string; desc: string; color: string; icon: React.ReactNode }[]> = {
  PENGURUS: [
    {
      title: "Manajemen Keuangan",
      desc: "Kelola pemasukan, pengeluaran, dan anggaran tiap divisi.",
      color: "from-emerald-500 to-teal-600",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></svg>,
    },
    {
      title: "Agenda & Proker",
      desc: "Susun dan perbarui program kerja tiap divisi.",
      color: "from-blueBright to-blue",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M9 12h6M9 16h6" /></svg>,
    },
    {
      title: "Event & Absensi",
      desc: "Buat event baru dan kelola pendaftaran peserta.",
      color: "from-purple-500 to-indigo-600",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    },
    {
      title: "E-Archieving",
      desc: "Simpan dan kelola dokumen serta hasil rapat.",
      color: "from-amber-500 to-orange-600",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
    },
    {
      title: "Moderasi LPJ",
      desc: "Periksa dan sahkan laporan pertanggungjawaban.",
      color: "from-rose-500 to-pink-600",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    },
    {
      title: "Aspirasi Masuk",
      desc: "Tindak lanjuti aspirasi dari perwakilan kelas.",
      color: "from-cyan-500 to-sky-600",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    },
    {
      title: "Manajemen Akun",
      desc: "Buat dan kelola akun pengguna langsung dari dashboard.",
      color: "from-navy to-navyAlt",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
  ],
};

const roleLabel: Record<string, string> = {
  PENGURUS: "Pengurus & Pembina",
};

export default async function PengurusDashboard() {
  const session = await getSession();
  const mods = roleModules[session?.peran ?? ""] ?? [];

  const totalTransaksi = await prisma.transaksiKeuangan.count();
  const totalEvent = await prisma.event.count();
  const totalArsip = await prisma.arsip.count();
  const totalLpj = await prisma.lpj.count();
  const totalAspirasi = await prisma.aspirasi.count();
  const totalPengguna = await prisma.pengguna.count();

  const stats = [
    { label: "Transaksi", value: totalTransaksi, hint: "Total transaksi tercatat", color: "text-emerald-600 bg-emerald-50", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
    { label: "Event", value: totalEvent, hint: "Total event dibuat", color: "text-purple-600 bg-purple-50", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { label: "Arsip", value: totalArsip, hint: "Dokumen tersimpan", color: "text-amber-600 bg-amber-50", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg> },
    { label: "LPJ", value: totalLpj, hint: "Laporan pertanggungjawaban", color: "text-rose-600 bg-rose-50", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
    { label: "Aspirasi", value: totalAspirasi, hint: "Aspirasi masuk", color: "text-cyan-600 bg-cyan-50", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
    { label: "Pengguna", value: totalPengguna, hint: "Total akun terdaftar", color: "text-blue-600 bg-blueSoft", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-navyAlt via-navy to-blueBright p-7 text-white shadow-card">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-blueBright/30 blur-2xl" />
        <div className="relative">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
            Dashboard {roleLabel[session?.peran ?? ""] ?? "Pengurus"}
          </div>
          <h1 className="mb-1 font-display text-[26px] font-bold leading-tight">
            Selamat datang, {session?.nama} 👋
          </h1>
          <p className="max-w-[560px] text-[14px] text-white/70">
            Kelola keuangan, proker, event, arsip, LPJ, hingga akun pengguna — semua dari satu tempat.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[14px] border border-[#E8EAF0] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-[11px] ${s.color}`}>
                {s.icon}
              </div>
              <span className="font-display text-[26px] font-bold text-navy">{s.value}</span>
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-inkFaint">{s.label}</div>
            <div className="text-[12.5px] text-inkSoft">{s.hint}</div>
          </div>
        ))}
      </div>

      {/* Feature modules */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h3 className="font-display text-[16px] font-bold text-navy">Modul Pengurus</h3>
          <span className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mods.map((m) => (
            <div key={m.title} className="group relative overflow-hidden rounded-[14px] border border-[#E8EAF0] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${m.color}`} />
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[11px] bg-bgAlt text-ink transition-all group-hover:bg-navy group-hover:text-white">
                {m.icon}
              </div>
              <h4 className="mb-1 text-[15px] font-semibold text-ink">{m.title}</h4>
              <p className="text-[13px] leading-relaxed text-inkSoft">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
