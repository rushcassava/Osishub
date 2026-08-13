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

// 2. Fungsi POST untuk memproses Check-In dari Scan QR
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!session) return jsonError("Tidak terautentikasi.", 401);

  try {
    const body = await req.json();
    const { qrData } = body;

    if (!qrData) {
      return jsonError("Data QR tidak valid.", 400);
    }

    // Di sini kamu bisa tambahkan logika database untuk mencatat kehadiran berdasarkan qrData
    // Contoh:
    // const event = await prisma.event.findFirst({ where: { tokenQR: qrData } });
    // if (!event) return jsonError("Event atau QR code tidak ditemukan/kedaluwarsa.", 404);
    // 
    // await prisma.absensi.create({
    //   data: {
    //     pengguna_id: session.id,
    //     event_id: event.id,
    //     hadir: true,
    //     waktuHadir: new Date(),
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: "Berhasil melakukan Check-In Absensi!",
    });
  } catch (err) {
    console.error("Error check-in absen:", err);
    return jsonError("Terjadi kesalahan pada server saat check-in.", 500);
  }
}