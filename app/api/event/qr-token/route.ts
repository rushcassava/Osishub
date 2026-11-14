
import { NextRequest, NextResponse } from "next/server";
import { requireSession, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
  throw new Error("SESSION_SECRET belum dikonfigurasi.");
}

const encodedKey = new TextEncoder().encode(secretKey);
const DURASI_ABSENSI = 60 * 1000;

export async function GET(req: NextRequest) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const eventIdRaw = new URL(req.url).searchParams.get("eventId");
  const eventId = Number(eventIdRaw);

  if (!eventIdRaw || !Number.isSafeInteger(eventId) || eventId <= 0) {
    return jsonError("eventId tidak valid.");
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id_event: eventId },
      select: {
        id_event: true,
        tanggal: true,
      },
    });

    if (!event) {
      return jsonError("Event tidak ditemukan.", 404);
    }

    const now = Date.now();
    const mulai = event.tanggal.getTime();
    const selesai = mulai + DURASI_ABSENSI;

    if (now < mulai) {
      return jsonError("Absensi belum dibuka.", 403);
    }

    if (now >= selesai) {
      return jsonError("Waktu absensi telah berakhir.", 403);
    }

    const token = await new SignJWT({
      eventId: event.id_event,
      purpose: "event-checkin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("20s")
      .sign(encodedKey);

    return NextResponse.json({ token });
  } catch (err) {
    console.error("QR token error:", err);
    return jsonError("Gagal membuat token QR.", 500);
  }
}
