import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const arsip = await prisma.arsip.findMany({
      orderBy: { dibuatPada: "desc" },
      include: { pembuat: { select: { nama: true } } },
    });
    return NextResponse.json({ arsip });
  } catch (err) {
    console.error("Error fetching arsip:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const { judul, kategori, deskripsi, file_nama, url } = await req.json();
    if (!judul || !file_nama || !url) {
      return jsonError("Judul, nama/format file, dan URL link wajib diisi.");
    }

    const created = await prisma.arsip.create({
      data: {
        judul,
        kategori: kategori || "Umum",
        deskripsi: deskripsi || null,
        file_nama: file_nama || null,
        url: url || null,
        pembuat_id: session.id,
      },
    });

    return NextResponse.json({ arsip: created }, { status: 201 });
  } catch (err) {
    console.error("Error creating arsip:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

