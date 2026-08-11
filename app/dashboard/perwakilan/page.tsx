import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const roleModules: { title: string; desc: string; color: string; icon: React.ReactNode }[] = [
  {
    title: "Aspirasi & Masukan",
    desc: "Ajukan aspirasi dan pantau status tindak lanjutnya.",
    color: "from-cyan-500 to-sky-600",
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  },
  {
    title: "Agenda & Proker",
    desc: "Pantau linimasa program kerja yang sedang berjalan.",
    color: "from-blueBright to-blue",
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M9 12h6M9 16h6" /></svg>,
  },
  {
    title: "Transparansi Dana",
    desc: "Lihat ringkasan kas masuk dan keluar tiap divisi.",
    color: "from-emerald-500 to-teal-600",
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></svg>,
  },
];

export default async function PerwakilanDashboard() {
  const session = await getSession();
  const mods = roleModules;

  const totalAspirasi = await prisma.aspirasi.count();
  const totalProker = await prisma.proker.count({ where: { status: "BERJALAN" } });
  const totalDana = await prisma.transaksiKeuangan.aggregate({
    _sum: { jumlah: true },
    where: { jenis: "PEMASUKAN" },
  });

  const stats = [
    { label: "Aspirasi Masuk", value: totalAspirasi, hint: "Total aspirasi yang perlu ditinjau", color: "text-cyan-600 bg-cyan-50", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
    { label: "Proker Berjalan", value: totalProker, hint: "Program kerja yang sedang berjalan", color: "text-blue-600 bg-blueSoft", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M9 12h6M9 16h6" /></svg> },
    { label: "Total Dana", value: `Rp ${Number(totalDana._sum.jumlah ?? 0).toLocaleString("id-ID")}`, hint: "Total pemasukan dana organisasi", color: "text-emerald-600 bg-emerald-50", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-gold via-amber-600 to-orange-600 p-7 text-white shadow-card">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-amber-400/30 blur-2xl" />
        <div className="relative">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-amber-100">
            Dashboard Perwakilan Kelas
          </div>
          <h1 className="mb-1 font-display text-[26px] font-bold leading-tight">
            Selamat datang, {session?.nama} 👋
          </h1>
          <p className="max-w-[560px] text-[14px] text-white/80">
            Jembatani suara kelasmu ke pengurus — tinjau aspirasi, pantau proker, dan pastikan dana transparan.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[14px] border border-[#E8EAF0] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-[11px] ${s.color}`}>
                {s.icon}
              </div>
              <span className="font-display text-[22px] font-bold text-navy">{s.value}</span>
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-inkFaint">{s.label}</div>
            <div className="text-[12.5px] text-inkSoft">{s.hint}</div>
          </div>
        ))}
      </div>

      {/* Feature modules */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h3 className="font-display text-[16px] font-bold text-navy">Modul Perwakilan</h3>
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
