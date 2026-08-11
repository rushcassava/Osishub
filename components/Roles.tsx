import { prisma } from "@/lib/prisma";

export default async function Roles() {
  const roles = await prisma.landingRole.findMany({
    orderBy: { urutan: "asc" },
    select: { tag: true, judul: true, deskripsi: true, item1: true, item2: true, item3: true },
  });

  return (
    <section id="peran" className="py-[88px]">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="mb-[52px] max-w-[600px]">
          <div className="mb-4 font-mono text-[12.5px] uppercase tracking-[0.14em] text-blue">
            Tiga Peran, Satu Sistem
          </div>
          <h2 className="mb-3.5 font-display text-[clamp(26px,3vw,36px)] font-bold tracking-tight text-navy">
            Setiap orang tahu perannya, sistem yang menjaga alurnya.
          </h2>
          <p className="text-[16px] text-inkSoft">
            OSIS-Hub dirancang mengikuti struktur organisasi yang
            sesungguhnya, dari anggota di kelas sampai pembina di tingkat
            sekolah.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
          {roles.map((r) => (
            <div
              key={r.tag}
              className="rounded-[14px] border border-line bg-panel p-[30px_26px] transition hover:-translate-y-1 hover:border-transparent hover:shadow-card"
            >
              <span className="mb-[18px] inline-block rounded-md bg-blueSoft px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-blue">
                {r.tag}
              </span>
              <h3 className="mb-2.5 font-display text-[19px] font-bold text-navy">{r.judul}</h3>
              <p className="mb-[18px] text-[14.5px] text-inkSoft">{r.deskripsi}</p>
              <ul className="flex flex-col gap-2">
                {[r.item1, r.item2, r.item3].map((it) => (
                  <li key={it} className="relative pl-[18px] text-[13.5px] text-inkSoft">
                    <span className="absolute left-0 top-[7px] h-1.5 w-1.5 rounded-full bg-gold" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
