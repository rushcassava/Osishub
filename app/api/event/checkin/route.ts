
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";
import { jwtVerify } from "jose";
import { Prisma } from "@prisma/client";

const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
  throw new Error("SESSION_SECRET belum dikonfigurasi.");
}

const encodedKey = new TextEncoder().encode(secretKey);
const DURASI_ABSENSI = 60 * 1000;

export async function POST(req: NextRequest) {
  // 1. Verifikasi sesi login pengguna
  const { session, error } = await requireSession();
  if (error) return error;
  if (!session) return jsonError("Tidak terautentikasi.", 401);

  try {
    // 2. Ambil token
    const body = await req.json().catch(() => null);

    if (!body || typeof body.token !== "string") {
      return jsonError("Token absensi wajib disertakan.", 400);
    }

    // 3. Verifikasi JWT
    let event_id: number;

    try {
      const { payload } = await jwtVerify(body.token, encodedKey);

      if (
        typeof payload.eventId !== "number" ||
        !Number.isSafeInteger(payload.eventId) ||
        payload.eventId <= 0 ||
        payload.purpose !== "event-checkin"
      ) {
        return jsonError("Token tidak mengandung data event yang valid.", 400);
      }

      event_id = payload.eventId;
    } catch (jwtErr: unknown) {
      if (
        jwtErr instanceof Error &&
        jwtErr.message.toLowerCase().includes("expired")
      ) {
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

    // 4. Cari event
    const event = await prisma.event.findUnique({
      where: { id_event: event_id },
      select: {
        id_event: true,
        judul: true,
        tanggal: true,
        lokasi: true,
      },
    });

    if (!event) {
      return jsonError("Event tidak ditemukan di database.", 404);
    }

    // 5. Periksa jadwal menggunakan waktu server
    const now = Date.now();
    const mulai = event.tanggal.getTime();
    const selesai = mulai + DURASI_ABSENSI;

    if (now < mulai) {
      return jsonError("Absensi belum dibuka.", 403);
    }

    if (now >= selesai) {
      return jsonError("Waktu absensi telah berakhir.", 403);
    }

    // 6. Catat absensi dan poin dalam satu transaksi
    const result = await prisma.$transaction(
      async (tx) => {
        const existingAbsensi = await tx.absensi.findUnique({
          where: {
            pengguna_id_event_id: {
              pengguna_id: session.id,
              event_id,
            },
          },
        });

        if (existingAbsensi?.hadir) {
          return {
            alreadyPresent: true,
            absensi: existingAbsensi,
            poinDitambah: 0,
          };
        }

        const waktuHadir = new Date();

        const absensi = existingAbsensi
          ? await tx.absensi.update({
              where: {
                pengguna_id_event_id: {
                  pengguna_id: session.id,
                  event_id,
                },
              },
              data: {
                hadir: true,
                waktuHadir,
              },
            })
          : await tx.absensi.create({
              data: {
                pengguna_id: session.id,
                event_id,
                hadir: true,
                waktuHadir,
              },
            });

        let poinDitambah = 0;

        if (!existingAbsensi) {
          await tx.poinKeaktifan.create({
            data: {
              pengguna_id: session.id,
              event_id,
              jumlah: 5,
              keterangan: `Hadir & check-in event: ${event.judul}`,
            },
          });

          poinDitambah = 5;
        }

        return {
          alreadyPresent: false,
          absensi,
          poinDitambah,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    if (result.alreadyPresent) {
      return jsonError(
        `Kamu sudah check-in untuk event "${event.judul}". Tidak bisa check-in dua kali.`,
        409
      );
    }

    return NextResponse.json({
      success: true,
      message: `Check-in berhasil untuk event "${event.judul}"!`,
      event: {
        id_event: event.id_event,
        judul: event.judul,
        tanggal: event.tanggal,
        lokasi: event.lokasi,
      },
      absensi_id: result.absensi.id_absensi,
      poin_ditambah: result.poinDitambah,
    });
  } catch (err: unknown) {
    console.error("[/api/event/checkin] Error:", err);

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2002" || err.code === "P2034")
    ) {
      return jsonError(
        "Check-in sedang diproses atau sudah tercatat. Silakan coba periksa status absensimu.",
        409
      );
    }

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
