import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

// 1. Fungsi GET untuk mengambil data absensi & poin
export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!session) return jsonError("Tidak terautentikasi.", 401);

  try {
    const [absensi, poinRows] = await Promise.all([
      prisma.absensi.findMany({
        where: { pengguna_id: session.id },
        orderBy: { waktuHadir: "desc" },
        include: { event: { select: { judul: true, tanggal: true } } },
      }),
      prisma.poinKeaktifan.findMany({
        where: { pengguna_id: session.id },
        orderBy: { dibuatPada: "desc" },
      }),
    ]);

    const totalPoin = poinRows.reduce((sum, p) => sum + p.jumlah, 0);
    const totalHadir = absensi.filter((a) => a.hadir).length;

    return NextResponse.json({
      absensi,
      poin: poinRows,
      totalPoin,
      totalHadir,
    });
  } catch (err) {
    console.error("Error fetching absen:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

// 2. Fungsi POST untuk memproses Check-In dari Scan QR + Tambah Poin Otomatis
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!session) return jsonError("Tidak terautentikasi.", 401);

  try {
    const { qrData } = await req.json();

    if (!qrData) {
      return jsonError("Data QR tidak valid.", 400);
    }

    // A. Cari event berdasarkan kolom qr_code
    const event = await prisma.event.findFirst({ 
      where: { qr_code: qrData } 
    });

    if (!event) {
      return jsonError("Event atau QR code tidak ditemukan.", 404);
    }

    // B. Cek apakah user sudah melakukan absen di event ini sebelumnya
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        pengguna_id: session.id,
        event_id: event.id_event,
      },
    });

    if (existingAbsensi) {
      return jsonError("Anda sudah melakukan check-in untuk event ini.", 400);
    }

    // C. Transaksi pencatatan absensi dan penambahan poin
    await prisma.$transaction(async (tx) => {
      await tx.absensi.create({
        data: {
          pengguna_id: session.id,
          event_id: event.id_event,
          hadir: true,
          waktuHadir: new Date(),
        },
      });

      await tx.poinKeaktifan.create({
        data: {
          pengguna_id: session.id,
          event_id: event.id_event,
          jumlah: 10,
          keterangan: `Hadir dalam kegiatan: ${event.judul}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil melakukan Check-In untuk event: ${event.judul}!`,
    });
  } catch (err) {
    console.error("Error check-in absen:", err);
    return jsonError("Terjadi kesalahan pada server saat check-in.", 500);
  }
}