const columns = [
  {
    title: "Platform",
    links: [
      { label: "Fitur", href: "#fitur" },
      { label: "Peran Pengguna", href: "#peran" },
      { label: "Alur Kerja", href: "#alur" },
    ],
  },
  {
    title: "Organisasi",
    links: [
      { label: "Transparansi Dana", href: "#transparansi" },
      { label: "Panduan Pengurus", href: "#" },
      { label: "Pusat Bantuan", href: "#" },
    ],
  },
  {
    title: "Kontak",
    links: [
      { label: "Ajukan Demo", href: "#kontak" },
      { label: "halo@osis-hub.id", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy pt-[70px] text-[#AEB8D1]">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="grid grid-cols-1 gap-10 border-b border-white/[0.12] pb-[50px] sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="#top" className="mb-3.5 flex items-center gap-2.5 font-display text-[19px] font-bold text-white">
              <span className="relative block h-[34px] w-[34px] rounded-[9px] bg-gradient-to-br from-blue to-navy">
                <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              OSIS-Hub
            </a>
            <p className="max-w-[260px] text-[13.5px] text-[#8C97B5]">
              Sistem manajemen organisasi siswa yang menghubungkan aspirasi,
              proker, keuangan, dan arsip dalam satu platform.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h5 className="mb-4 font-mono text-[11.5px] uppercase tracking-[0.08em] text-[#7C87A8]">
                {col.title}
              </h5>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-[13.5px] text-[#C4CBE0] transition hover:text-white">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between gap-2.5 py-6 text-[12.5px] text-[#6E7999]">
          <span>© 2026 OSIS-Hub. Dibuat untuk mendukung digitalisasi organisasi siswa.</span>
          <span>Dirancang untuk struktur OSIS, dari kelas hingga pembina.</span>
        </div>
      </div>
    </footer>
  );
}
