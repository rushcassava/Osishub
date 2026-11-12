import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";
import { jwtVerify } from "jose";
import { Prisma } from "@prisma/client";

const secretKey = process.env.SESSION_SECRET || "ganti-secret-ini-di-file-env";
const encodedKey = new TextEncoder().encode(secretKey);

export async function POST(req: NextRequest) {
  // 1. Verifikasi sesi login pengguna
  const { session, error } = await requireSession();
  if (error) return error;
  if (!session) return jsonError("Tidak terautentikasi.", 401);

  try {
    // 2. Ambil token dari body request
    const body = await req.json().catch(() => null);
    if (!body || !body.token) {
      return jsonError("Token absensi wajib disertakan.", 400);
    }

    const { token } = body;

    // 3. Verifikasi token JWT dan ekstrak event_id
    let event_id: number;
    try {
      const { payload } = await jwtVerify(token, encodedKey);
      if (!payload.eventId || typeof payload.eventId !== "number") {
        return jsonError("Token tidak mengandung data event yang valid.", 400);
      }
      event_id = payload.eventId;
    } catch (jwtErr: unknown) {
      // Bedakan antara token expired dan token tidak valid
      if (jwtErr instanceof Error && jwtErr.message.includes("expired")) {
        return jsonError(
          "QR Code sudah kedaluwarsa. Minta panitia menampilkan QR Code terbaru.",
          401
        );
      }
      return jsonError(
        "Token absensi tidak valid. Pastikan memindai QR Code dari layar Panitia.",
        400
      );
    }

    // 4. Verifikasi event ada di database
    const event = await prisma.event.findUnique({
      where: { id_event: event_id },
      select: { id_event: true, judul: true, tanggal: true, lokasi: true },
    });

    if (!event) {
      return jsonError("Event tidak ditemukan di database.", 404);
    }

    // 5. Cek apakah pengguna sudah check-in untuk event ini
    const existingAbsensi = await prisma.absensi.findUnique({
      where: {
        pengguna_id_event_id: {
          pengguna_id: session.id,
          event_id: event_id,
        },
      },
      select: { id_absensi: true, hadir: true },
    });

    if (existingAbsensi?.hadir) {
      return jsonError(
        `Kamu sudah check-in untuk event "${event.judul}". Tidak bisa check-in dua kali.`,
        409
      );
    }

    // 6. Gunakan transaksi untuk atomically mencatat absensi dan poin
    const result = await prisma.$transaction(async (tx) => {
      // Upsert absensi (buat baru atau update yang sudah ada tapi belum hadir)
      const absensi = await tx.absensi.upsert({
        where: {
          pengguna_id_event_id: {
            pengguna_id: session.id,
            event_id: event_id,
          },
        },
        update: {
          hadir: true,
          waktuHadir: new Date(),
        },
        create: {
          pengguna_id: session.id,
          event_id: event_id,
          hadir: true,
          waktuHadir: new Date(),
        },
      });

      // Beri poin hanya jika belum pernah ada record absensi sebelumnya
      if (!existingAbsensi) {
        await tx.poinKeaktifan.create({
          data: {
            pengguna_id: session.id,
            event_id: event_id,
            jumlah: 5,
            keterangan: `Hadir & check-in event: ${event.judul}`,
          },
        });
      }

      return absensi;
    });

    return NextResponse.json({
      success: true,
      message: `Check-in berhasil untuk event "${event.judul}"!`,
      event: {
        id_event: event.id_event,
        judul: event.judul,
        tanggal: event.tanggal,
        lokasi: event.lokasi,
      },
      absensi_id: result.id_absensi,
      poin_ditambah: !existingAbsensi ? 5 : 0,
    });
  } catch (err: unknown) {
    console.error("[/api/event/checkin] Error:", err);

    // Handle Prisma unique constraint violation (duplikasi)
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return jsonError(
        "Kamu sudah terdaftar untuk event ini. Duplikasi absensi dicegah.",
        409
      );
    }

    // Handle Prisma foreign key / data not found
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return jsonError(
        "Data tidak ditemukan. Event mungkin sudah dihapus.",
        404
      );
    }

    return jsonError(
      "Terjadi kesalahan pada server saat memproses check-in. Silakan coba lagi.",
      500
    );
  }
}
