import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  if (Number.isNaN(id)) return jsonError("ID tidak valid.");

  try {
    const existing = await prisma.proker.findUnique({ where: { id_proker: id } });
    if (!existing) return jsonError("Proker tidak ditemukan.", 404);

    const body = await req.json();
    const data: any = {};
    if (body.judul) data.judul = body.judul;
    if (body.deskripsi !== undefined) data.deskripsi = body.deskripsi;
    if (body.divisi) data.divisi = body.divisi;
    if (body.status) data.status = body.status;
    if (body.targetSelesai) data.targetSelesai = new Date(body.targetSelesai);

    const updated = await prisma.proker.update({
      where: { id_proker: id },
      data,
    });
    return NextResponse.json({ proker: updated });
  } catch (err) {
    console.error("Error updating proker:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

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
    const existing = await prisma.proker.findUnique({ where: { id_proker: id } });
    if (!existing) return jsonError("Proker tidak ditemukan.", 404);

    await prisma.proker.delete({ where: { id_proker: id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting proker:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}