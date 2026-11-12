import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";
import { Prisma } from "@prisma/client";

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
    console.error("[/api/absen GET] Error:", err);
    return jsonError("Terjadi kesalahan pada server saat memuat data absensi.", 500);
  }
}

// 2. Fungsi POST untuk memproses Check-In dari Scan QR (format QR lama dengan qr_code)
//    Catatan: Alur utama check-in menggunakan /api/event/checkin dengan token JWT.
//    Endpoint ini dipertahankan sebagai fallback untuk QR Code format lama.
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!session) return jsonError("Tidak terautentikasi.", 401);

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.qrData) {
      return jsonError(
        "Data QR tidak valid. Pastikan Anda memindai QR Code event yang benar.",
        400
      );
    }

    const { qrData } = body;

    if (typeof qrData !== "string" || qrData.trim().length === 0) {
      return jsonError("Data QR tidak boleh kosong.", 400);
    }

    // A. Cari event berdasarkan kolom qr_code (format lama)
    const event = await prisma.event.findFirst({
      where: { qr_code: qrData.trim() },
      select: { id_event: true, judul: true, tanggal: true },
    });

    if (!event) {
      return jsonError(
        "QR Code tidak dikenali atau event tidak ditemukan. Pastikan memindai QR Code dari sistem OSIS-Hub.",
        404
      );
    }

    // B. Cek apakah user sudah absen di event ini
    const existingAbsensi = await prisma.absensi.findUnique({
      where: {
        pengguna_id_event_id: {
          pengguna_id: session.id,
          event_id: event.id_event,
        },
      },
      select: { id_absensi: true, hadir: true },
    });

    if (existingAbsensi?.hadir) {
      return jsonError(
        `Kamu sudah melakukan check-in untuk event "${event.judul}". Tidak bisa check-in dua kali.`,
        409
      );
    }

    // C. Transaksi pencatatan absensi dan penambahan poin
    await prisma.$transaction(async (tx) => {
      await tx.absensi.upsert({
        where: {
          pengguna_id_event_id: {
            pengguna_id: session.id,
            event_id: event.id_event,
          },
        },
        update: { hadir: true, waktuHadir: new Date() },
        create: {
          pengguna_id: session.id,
          event_id: event.id_event,
          hadir: true,
          waktuHadir: new Date(),
        },
      });

      // Tambah poin hanya jika belum pernah ada record absensi
      if (!existingAbsensi) {
        await tx.poinKeaktifan.create({
          data: {
            pengguna_id: session.id,
            event_id: event.id_event,
            jumlah: 10,
            keterangan: `Hadir dalam kegiatan: ${event.judul}`,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil melakukan Check-In untuk event: ${event.judul}!`,
      event: { id_event: event.id_event, judul: event.judul },
    });
  } catch (err: unknown) {
    console.error("[/api/absen POST] Error:", err);

    // Handle Prisma unique constraint violation
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return jsonError(
        "Duplikasi absensi terdeteksi. Kamu sudah terdaftar untuk event ini.",
        409
      );
    }

    return jsonError(
      "Terjadi kesalahan pada server saat memproses check-in. Silakan coba lagi.",
      500
    );
  }
}