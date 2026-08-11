const nodes = [
  { label: "Aspirasi", cx: 200, cy: 70, delay: "0.1s" },
  { label: "Proker", cx: 330, cy: 140, delay: "0.25s" },
  { label: "Dana", cx: 340, cy: 260, delay: "0.4s" },
  { label: "Event", cx: 230, cy: 340, delay: "0.55s" },
  { label: "Arsip", cx: 70, cy: 280, delay: "0.7s" },
  { label: "Absen", cx: 60, cy: 150, delay: "0.85s" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-[radial-gradient(1200px_600px_at_78%_-10%,#EDF2FC_0%,#F6F7FA_55%)]">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-7 pb-[70px] pt-24 md:grid-cols-2">
        <div>
          <div className="mb-[22px] flex items-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.14em] text-blue">
            <span className="inline-block h-[1.5px] w-[22px] bg-blue" />
            Sistem Manajemen OSIS Terpadu
          </div>

          <h1 className="mb-[22px] font-display text-[clamp(34px,4.4vw,56px)] font-bold leading-[1.06] tracking-tight text-navy">
            Menjalankan organisasi siswa,
            <br />
            <span className="text-blue">tanpa kehilangan arah.</span>
          </h1>

          <p className="mb-8 max-w-[480px] text-[17px] text-inkSoft">
            Dari aspirasi kelas sampai laporan pertanggungjawaban — OSIS-Hub
            mencatat, menghubungkan, dan mempertanggungjawabkan setiap
            langkah organisasi dalam satu platform.
          </p>

          <div className="mb-[34px] flex flex-wrap gap-3.5">
            <a
              href="#kontak"
              className="rounded-[9px] bg-navy px-[22px] py-[11px] text-[14.5px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue hover:shadow-[0_10px_24px_-10px_rgba(46,90,172,0.55)]"
            >
              Ajukan Demo untuk Sekolah
            </a>
            <a
              href="#fitur"
              className="rounded-[9px] border border-line px-[22px] py-[11px] text-[14.5px] font-semibold text-ink transition hover:border-inkSoft"
            >
              Lihat Semua Fitur
            </a>
          </div>

          <div className="flex flex-wrap gap-7">
            {[
              ["8", "Modul terintegrasi"],
              ["3", "Peran pengguna"],
              ["100%", "Dana tercatat & terlacak"],
            ].map(([num, lbl]) => (
              <div key={lbl} className="flex flex-col gap-0.5">
                <span className="font-display text-[22px] font-bold text-navy">{num}</span>
                <span className="text-[12.5px] text-inkFaint">{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[420px] md:max-w-none" aria-hidden="true">
          <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible">
            {nodes.map((n) => (
              <path
                key={n.label + "-line"}
                d={`M200,200 L${n.cx},${n.cy}`}
                className="motion-safe-only fill-none stroke-[#B9C6E4] [stroke-width:1.4px] [stroke-dasharray:280]"
                style={{ animation: `draw 1.4s ease forwards`, animationDelay: n.delay, strokeDashoffset: 280 }}
              />
            ))}

            {nodes.map((n) => (
              <g key={n.label}>
                <circle
                  cx={n.cx}
                  cy={n.cy}
                  r="34"
                  className="fill-white stroke-line"
                  style={{ filter: "drop-shadow(0 10px 20px rgba(20,30,60,0.08))" }}
                />
                <text
                  x={n.cx}
                  y={n.cy + 4}
                  textAnchor="middle"
                  className="fill-ink font-body text-[10.5px] font-semibold"
                >
                  {n.label}
                </text>
              </g>
            ))}

            <circle
              cx="200"
              cy="200"
              r="54"
              className="motion-safe-only fill-none stroke-blueBright [stroke-width:1.2px]"
              style={{ transformOrigin: "center", animation: "pulse2 2.8s ease-in-out infinite" }}
            />
            <circle cx="200" cy="200" r="54" className="fill-navy" />
            <text x="200" y="196" textAnchor="middle" className="fill-white font-display text-[12px] font-bold">
              OSIS
            </text>
            <text x="200" y="212" textAnchor="middle" className="fill-gold font-display text-[12px] font-bold">
              HUB
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
