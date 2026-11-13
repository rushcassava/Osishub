export default function CTA() {
  return (
    <section id="kontak" className="py-[88px]">
      <div className="relative mx-auto flex max-w-[1180px] flex-col items-start gap-8 overflow-hidden rounded-[22px] bg-[#122A5C] px-9 py-16 text-white shadow-xl md:flex-row md:items-center md:justify-between md:px-14 transition-all duration-300 hover:shadow-2xl">
        
        {/* Efek Cahaya Dekoratif dengan Animasi Pulse/Gerak */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />

        {/* Sisi Kiri: Teks & Badge */}
        <div className="relative z-10 transition-transform duration-300 hover:translate-x-1">
          <span className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-900/60 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            Program Perintis Sekolah
          </span>
          <h2 className="max-w-[420px] font-display text-[clamp(24px,2.8vw,32px)] font-bold tracking-tight leading-snug text-white">
            Siap membuat organisasi lebih rapi dan transparan?
          </h2>
          <p className="mt-2.5 max-w-[400px] text-[14.5px] text-blue-100">
            Ajukan demo OSIS-Hub untuk sekolah atau organisasi Anda, gratis
            untuk periode kepengurusan pertama.
          </p>
        </div>

        {/* Sisi Kanan: Tombol dengan Efek Gerak & Micro-trust */}
        <div className="relative z-10 flex flex-col items-start md:items-end gap-3">
          <div className="flex flex-wrap items-center gap-3.5">
            <a
              href="#demo"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[14px] font-semibold text-[#122A5C] shadow-sm transition-all duration-300 hover:bg-blue-50 hover:scale-105 hover:shadow-md"
            >
              Ajukan Demo Gratis
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
            <a
              href="https://wa.me/..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-[14px] font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              Hubungi Tim OSIS-Hub
            </a>
          </div>
          <p className="text-[12px] text-blue-200">
            ✓ Setup dibantu tim &nbsp;•&nbsp; ✓ Tanpa kartu kredit
          </p>
        </div>

      </div>
    </section>
  );
}