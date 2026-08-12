import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function DELETE(
  _req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  if (Number.isNaN(id)) return jsonError("ID tidak valid.");

  try {
    const existing = await prisma.transaksiKeuangan.findUnique({
      where: { id_transaksi: id },
    });
    if (!existing) return jsonError("Transaksi tidak ditemukan.", 404);

    await prisma.transaksiKeuangan.delete({ where: { id_transaksi: id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting transaksi:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}