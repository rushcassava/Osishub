import { prisma } from "@/lib/prisma";

export default async function Testimonial() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { urutan: "asc" },
    select: { nama: true, peran: true, kutipan: true, avatar_inisial: true },
  });

  if (testimonials.length === 0) {
    return null;
  }

  // Acak testimonial untuk variasi
  const shuffled = [...testimonials].sort(() => Math.random() - 0.5);
  const featured = shuffled[0];

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <span
        className="pointer-events-none absolute -left-5 -top-16 select-none font-display text-[340px] leading-none text-white/[0.04]"
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <div className="relative mx-auto max-w-[760px] px-7 py-[88px] text-center">
        <p className="mb-7 font-display text-[clamp(20px,2.4vw,28px)] font-medium leading-[1.4] text-white">
          &ldquo;{featured.kutipan}&rdquo;
        </p>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[14.5px] font-bold">{featured.nama}</span>
          <span className="text-[13px] text-[#9AA4C0]">{featured.peran}</span>
        </div>
      </div>
    </section>
  );
}
