import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const roleModules: { title: string; desc: string; color: string; icon: React.ReactNode }[] = [
  {
    title: "Tinjau Aspirasi Kelas",
    desc: "Verifikasi dan teruskan aspirasi dari kelasmu ke divisi terkait.",
    color: "from-cyan-500 to-sky-600",
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  },
  {
    title: "Event & Registrasi",
    desc: "Daftar event OSIS dan lakukan check-in QR.",
    color: "from-purple-500 to-indigo-600",
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  },
  {
    title: "Absen & Poin Keaktifan",
    desc: "Lihat riwayat kehadiran dan poin keaktifanmu.",
    color: "from-emerald-500 to-teal-600",
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  },
];

export default async function AnggotaDashboard() {
  const session = await getSession();
  const mods = roleModules;

  const totalAspirasi = await prisma.aspirasi.count({
    where: { penulis_id: session?.id },
  });
  const totalEvent = await prisma.registrasiEvent.count({
    where: { pengguna_id: session?.id },
  });
  const totalPoin = await prisma.poinKeaktifan.count({
    where: { pengguna_id: session?.id },
  });

  const stats = [
    { label: "Aspirasiku", value: totalAspirasi, hint: "Aspirasi yang pernah diajukan", color: "text-cyan-600 bg-cyan-50", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
    { label: "Event Diikuti", value: totalEvent, hint: "Registrasi event yang kamu ikuti", color: "text-purple-600 bg-purple-50", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { label: "Poin Keaktifan", value: totalPoin, hint: "Total aktivitas tercatat", color: "text-emerald-600 bg-emerald-50", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-blueBright via-blue to-navy p-7 text-white shadow-card">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-blueBright/30 blur-2xl" />
        <div className="relative">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
            Dashboard Anggota OSIS
          </div>
          <h1 className="mb-1 font-display text-[26px] font-bold leading-tight">
            Selamat datang, {session?.nama} 👋
          </h1>
          <p className="max-w-[560px] text-[14px] text-white/70">
            Bersuara lewat aspirasi, ikut event, dan pantau poin keaktifanmu di sini.
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
          <h3 className="font-display text-[16px] font-bold text-navy">Modul Anggota</h3>
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
