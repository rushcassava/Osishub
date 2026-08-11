export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: {
        urutan: "asc",
      },
      select: {
        id_testimonial: true,
        nama: true,
        peran: true,
        kutipan: true,
        avatar_inisial: true,
      },
    });

    return NextResponse.json({ testimonials });
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

