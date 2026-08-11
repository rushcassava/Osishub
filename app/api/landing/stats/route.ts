export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stats = await prisma.statistic.findMany({
      orderBy: {
        urutan: "asc",
      },
      select: {
        id_statistic: true,
        angka: true,
        suffix: true,
        label: true,
        deskripsi: true,
      },
    });

    return NextResponse.json({ stats });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

