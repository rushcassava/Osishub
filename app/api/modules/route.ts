import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const peran = searchParams.get("peran");

  if (!peran) {
    return NextResponse.json(
      { error: "Parameter 'peran' wajib diisi." },
      { status: 400 }
    );
  }

  // Validasi nilai peran
  const validRoles = ["ANGGOTA", "PERWAKILAN_KELAS", "PENGURUS", "PEMBINA"];
  if (!validRoles.includes(peran)) {
    return NextResponse.json(
      { error: "Nilai 'peran' tidak valid." },
      { status: 400 }
    );
  }

  try {
    const modules = await prisma.module.findMany({
      where: {
        peran: peran as any,
      },
      orderBy: {
        urutan: "asc",
      },
      select: {
        id_module: true,
        judul: true,
        deskripsi: true,
        status: true,
      },
    });

    return NextResponse.json({ modules });
  } catch (err) {
    console.error("Error fetching modules:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

