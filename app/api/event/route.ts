import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    // Ambil semua event beserta total peserta dan status registrasi user
    const events = await prisma.event.findMany({
      orderBy: { tanggal: "asc" },
      include: {
        registrasi: {
          select: { pengguna_id: true, status: true },
        },
      },
    });

    const data = events.map((e) => ({
      id_event: e.id_event,
      judul: e.judul,
      deskripsi: e.deskripsi,
      tanggal: e.tanggal,
      lokasi: e.lokasi,
      kuota: e.kuota,
      jumlah_peserta: e.registrasi.length,
      terdaftar: e.registrasi.find((r) => r.pengguna_id === session.id)?.status || null,
    }));

    return NextResponse.json({ events: data });
  } catch (err) {
    console.error("Error fetching events:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const { judul, deskripsi, tanggal, lokasi, kuota } = await req.json();
    if (!judul || !deskripsi || !tanggal || !lokasi) {
      return jsonError("Judul, deskripsi, tanggal, dan lokasi wajib diisi.");
    }

    const created = await prisma.event.create({
      data: {
        judul,
        deskripsi,
        tanggal: new Date(tanggal),
        lokasi,
        kuota: parseInt(kuota, 10) || 50,
      },
    });

    return NextResponse.json({ event: created }, { status: 201 });
  } catch (err) {
    console.error("Error creating event:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

