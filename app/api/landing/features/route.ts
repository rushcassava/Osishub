import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const features = await prisma.feature.findMany({
      orderBy: {
        urutan: "asc",
      },
      select: {
        id_feature: true,
        judul: true,
        deskripsi: true,
        icon_type: true,
        icon_path: true,
      },
    });

    return NextResponse.json({ features });
  } catch (err) {
    console.error("Error fetching features:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

