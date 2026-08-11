import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { event_id } = await req.json();
    if (!event_id) return jsonError("Event wajib dipilih.");

    const event = await prisma.event.findUnique({
      where: { id_event: parseInt(event_id, 10) },
      include: { registrasi: true },
    });

    if (!event) return jsonError("Event tidak ditemukan.", 404);

    const sudahTerdaftar = event.registrasi.some(
      (r) => r.pengguna_id === session.id && r.status !== "BATAL"
    );
    if (sudahTerdaftar) return jsonError("Kamu sudah terdaftar di event ini.", 409);

    const jumlahAktif = event.registrasi.filter((r) => r.status !== "BATAL").length;
    if (jumlahAktif >= event.kuota) return jsonError("Kuota event sudah penuh.", 409);

    const registrasi = await prisma.registrasiEvent.upsert({
      where: {
        event_id_pengguna_id: { event_id: event.id_event, pengguna_id: session.id },
      },
      update: { status: "TERDAFTAR", checkinPada: null },
      create: {
        event_id: event.id_event,
        pengguna_id: session.id,
        status: "TERDAFTAR",
      },
    });

    return NextResponse.json({ registrasi }, { status: 201 });
  } catch (err) {
    console.error("Error daftar event:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

