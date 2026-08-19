import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET || "ganti-secret-ini-di-file-env";
const encodedKey = new TextEncoder().encode(secretKey);

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { token } = await req.json();
    if (!token) return jsonError("Token absensi wajib disertakan.");

    let event_id: number;
    try {
      const { payload } = await jwtVerify(token, encodedKey);
      event_id = payload.eventId as number;
    } catch (err) {
      return jsonError("Token absensi tidak valid atau sudah kedaluwarsa.", 400);
    }

    const event = await prisma.event.findUnique({
      where: { id_event: event_id },
    });

    if (!event) return jsonError("Event tidak ditemukan.", 404);

    const absensi = await prisma.absensi.findUnique({
      where: {
        pengguna_id_event_id: {
          event_id: event_id,
          pengguna_id: session.id,
        },
      },
    });

    if (absensi && absensi.hadir) {
      return jsonError("Kamu sudah check-in untuk event ini.", 409);
    }

    // Catat absensi
    await prisma.absensi.upsert({
      where: {
        pengguna_id_event_id: {
          pengguna_id: session.id,
          event_id: event_id,
        },
      },
      update: { hadir: true, waktuHadir: new Date() },
      create: {
        pengguna_id: session.id,
        event_id: event_id,
        hadir: true,
        waktuHadir: new Date(),
      },
    });

    // Beri poin keaktifan jika belum pernah check-in sebelumnya
    if (!absensi) {
      await prisma.poinKeaktifan.create({
        data: {
          pengguna_id: session.id,
          event_id: event_id,
          jumlah: 5,
          keterangan: "Hadir & check-in event",
        },
      });
    }

    return NextResponse.json({ success: true, event });
  } catch (err) {
    console.error("Error check-in event:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

