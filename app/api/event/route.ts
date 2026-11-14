import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

// GET: Mengambil daftar event
export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const events = await prisma.event.findMany({
      orderBy: { tanggal: "asc" },
      include: {
        absensi: {
          where: { pengguna_id: session.id },
          select: { hadir: true },
        },
      },
    });

    const data = events.map((e) => ({
      id_event: e.id_event,
      judul: e.judul,
      deskripsi: e.deskripsi,
      tanggal: e.tanggal,
      lokasi: e.lokasi,
      hadir: e.absensi.length > 0 ? e.absensi[0].hadir : false,
    }));

    return NextResponse.json({ events: data });
  } catch (err) {
    console.error("Error fetching events:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

// POST: Membuat event baru
export async function POST(req: NextRequest) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const { judul, deskripsi, tanggal, lokasi } = await req.json();

    if (!judul || !deskripsi || !tanggal || !lokasi) {
      return jsonError(
        "Judul, deskripsi, tanggal, dan lokasi wajib diisi."
      );
    }

    // Validasi format tanggal dari input datetime-local
    if (
      typeof tanggal !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(tanggal)
    ) {
      return jsonError("Format tanggal tidak valid.");
    }

    // Konversi waktu WIB (UTC+7) menjadi waktu UTC
    const tanggalEvent = new Date(`${tanggal}:00+07:00`);

    if (Number.isNaN(tanggalEvent.getTime())) {
      return jsonError("Tanggal event tidak valid.");
    }

    const created = await prisma.event.create({
      data: {
        judul,
        deskripsi,
        tanggal: tanggalEvent,
        lokasi,
      },
    });

    return NextResponse.json(
      { event: created },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating event:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}