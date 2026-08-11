 import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const lpj = await prisma.lpj.findMany({
      orderBy: { diajukanPada: "desc" },
      include: {
        pembuat: { select: { nama: true } },
        reviewer: { select: { nama: true } },
      },
    });

    // PENGURUS/PEMBINA lihat semua; lainnya hanya punyanya sendiri (kalau ada)
    const data = session.peran === "PENGURUS" || session.peran === "PEMBINA"
      ? lpj
      : lpj.filter((l) => l.pembuat_id === session.id);

    return NextResponse.json({ lpj: data });
  } catch (err) {
    console.error("Error fetching lpj:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const { judul, isi } = await req.json();
    if (!judul || !isi) return jsonError("Judul dan isi LPJ wajib diisi.");

    const created = await prisma.lpj.create({
      data: {
        judul,
        isi,
        pembuat_id: session.id,
      },
    });

    return NextResponse.json({ lpj: created }, { status: 201 });
  } catch (err) {
    console.error("Error creating lpj:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

