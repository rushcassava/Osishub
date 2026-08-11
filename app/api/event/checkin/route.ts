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

    const registrasi = await prisma.registrasiEvent.findUnique({
      where: {
        event_id_pengguna_id: {
          event_id: event_id,
          pengguna_id: session.id,
        },
      },
    });

    if (!registrasi) return jsonError("Kamu belum terdaftar di event ini.", 404);
    if (registrasi.status === "HADIR") return jsonError("Kamu sudah check-in.", 409);

    const updated = await prisma.registrasiEvent.update({
      where: { id_registrasi: registrasi.id_registrasi },
      data: { status: "HADIR", checkinPada: new Date() },
      include: { event: true },
    });

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

    // Beri poin keaktifan
    await prisma.poinKeaktifan.create({
      data: {
        pengguna_id: session.id,
        event_id: event_id,
        jumlah: 5,
        keterangan: "Hadir & check-in event",
      },
    });

    return NextResponse.json({ registrasi: updated });
  } catch (err) {
    console.error("Error check-in event:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

