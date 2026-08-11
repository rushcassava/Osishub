import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireSession();
  if (error) return error;

  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return jsonError("ID tidak valid.");

  try {
    const event = await prisma.event.findUnique({
      where: { id_event: id },
      include: {
        registrasi: {
          include: { pengguna: { select: { nama: true, kelas: true, username: true } } },
        },
      },
    });
    if (!event) return jsonError("Event tidak ditemukan.", 404);
    return NextResponse.json({ event });
  } catch (err) {
    console.error("Error fetching event:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return jsonError("ID tidak valid.");

  try {
    const existing = await prisma.event.findUnique({ where: { id_event: id } });
    if (!existing) return jsonError("Event tidak ditemukan.", 404);

    await prisma.event.delete({ where: { id_event: id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting event:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

