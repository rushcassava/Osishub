import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function DELETE(
  _req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // <-- Ubah menjadi Promise
) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  // Wajib menggunakan await di Next.js 16
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  
  if (Number.isNaN(id)) return jsonError("ID tidak valid.");

  try {
    const existing = await prisma.arsip.findUnique({ where: { id_arsip: id } });
    if (!existing) return jsonError("Arsip tidak ditemukan.", 404);

    await prisma.arsip.delete({ where: { id_arsip: id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting arsip:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}