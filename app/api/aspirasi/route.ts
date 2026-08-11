import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // "saya" | "masuk" | "semua"

  try {
    let where: any = {};

    if (session.peran === "PERWAKILAN_KELAS") {
      // Perwakilan mengajukan aspirasi, hanya melihat aspirasi sendiri
      where = { penulis_id: session.id };
    } else if (session.peran === "ANGGOTA") {
      // Anggota meninjau aspirasi kelas (semua, tapi ditandai penulisnya)
      where = {};
    } else if (session.peran === "PENGURUS" || session.peran === "PEMBINA") {
      where = {};
      if (filter === "masuk") {
        where = { status: { in: ["DITINJAU", "DISETUJUI"] } };
      }
    }

    const aspirasi = await prisma.aspirasi.findMany({
      where,
      orderBy: { dibuatPada: "desc" },
      include: {
        penulis: { select: { nama: true, kelas: true, peran: true } },
      },
    });

    return NextResponse.json({ aspirasi });
  } catch (err) {
    console.error("Error fetching aspirasi:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { judul, isi, kategori } = await req.json();
    if (!judul || !isi) return jsonError("Judul dan isi wajib diisi.");

    const created = await prisma.aspirasi.create({
      data: {
        judul,
        isi,
        kategori: kategori || "Umum",
        penulis_id: session.id,
        kelas: (session as any).kelas || null,
      },
    });

    return NextResponse.json({ aspirasi: created }, { status: 201 });
  } catch (err) {
    console.error("Error creating aspirasi:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

