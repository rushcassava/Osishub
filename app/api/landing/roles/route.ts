export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.landingRole.findMany({
      orderBy: {
        urutan: "asc",
      },
      select: {
        id_landing_role: true,
        tag: true,
        judul: true,
        deskripsi: true,
        item1: true,
        item2: true,
        item3: true,
      },
    });

    return NextResponse.json({ roles });
  } catch (err) {
    console.error("Error fetching landing roles:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

