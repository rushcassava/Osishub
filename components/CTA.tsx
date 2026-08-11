export default function CTA() {
  return (
    <section id="kontak" className="py-[88px]">
      <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-8 rounded-[22px] bg-gradient-to-br from-blue to-[#1D3B79] px-9 py-16 text-white md:flex-row md:items-center md:justify-between md:px-14">
        <div>
          <h2 className="max-w-[420px] font-display text-[clamp(24px,2.8vw,32px)] font-bold tracking-tight">
            Siap membuat organisasi lebih rapi dan transparan?
          </h2>
          <p className="mt-2.5 max-w-[400px] text-[14.5px] text-[#DCE4F7]">
            Ajukan demo OSIS-Hub untuk sekolah atau organisasi Anda, gratis
            untuk periode kepengurusan pertama.
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-3.5">
          <a
            href="#"
            className="rounded-[9px] bg-white px-[22px] py-[11px] text-[14.5px] font-semibold text-navy transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgba(0,0,0,0.35)]"
          >
            Ajukan Demo
          </a>
          <a
            href="#"
            className="rounded-[9px] border border-white/40 px-[22px] py-[11px] text-[14.5px] font-semibold text-white transition hover:bg-white/10"
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </section>
  );
}
