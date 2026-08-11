import { prisma } from "@/lib/prisma";

export default async function Stats() {
  const stats = await prisma.statistic.findMany({
    orderBy: { urutan: "asc" },
    select: { angka: true, suffix: true, label: true, deskripsi: true },
  });

  return (
    <section className="bg-navy text-white">
      <div className="mx-auto grid max-w-[1180px] grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="border-white/[0.12] px-7 py-10 md:border-r md:last:border-r-0"
          >
            <div className="font-display text-[clamp(24px,2.6vw,34px)] font-bold text-white">
              {s.angka}
              <span className="text-gold">{s.suffix}</span> {s.label}
            </div>
            <div className="mt-1.5 text-[13px] text-[#AEB8D1]">{s.deskripsi}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
