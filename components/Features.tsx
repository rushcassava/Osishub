import { prisma } from "@/lib/prisma";

export default async function Features() {
  const features = await prisma.feature.findMany({
    orderBy: { urutan: "asc" },
    select: { judul: true, deskripsi: true, icon_type: true, icon_path: true },
  });

  return (
    <section id="fitur" className="bg-bgAlt py-[88px]">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="mb-[52px] max-w-[600px]">
          <div className="mb-4 font-mono text-[12.5px] uppercase tracking-[0.14em] text-blue">Fitur Utama</div>
          <h2 className="mb-3.5 font-display text-[clamp(26px,3vw,36px)] font-bold tracking-tight text-navy">
            Delapan modul yang menjalankan roda organisasi.
          </h2>
          <p className="text-[16px] text-inkSoft">
            Dibangun langsung dari kebutuhan nyata pengurus OSIS — bukan fitur generik yang dipaksakan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.judul} className="bg-panel p-[30px_24px] transition hover:bg-blueSoft">
              <div className="mb-5 flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-navy">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 stroke-gold">
                  {f.icon_type === "rect" && <rect x="3" y="4" width="18" height="18" rx="2" />}
                  {f.icon_type === "circle" && <circle cx="12" cy="12" r="10" />}
                  {f.icon_type === "squares" && (
                    <>
                      <rect x="3" y="7" width="5" height="5" />
                      <rect x="16" y="7" width="5" height="5" />
                      <rect x="9.5" y="14" width="5" height="5" />
                    </>
                  )}
                  {f.icon_type === "path" && f.icon_path && <path d={f.icon_path} />}
                </svg>
              </div>
              <h4 className="mb-2 font-display text-[15.5px] font-bold text-navy">{f.judul}</h4>
              <p className="text-[13.5px] text-inkSoft">{f.deskripsi}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
