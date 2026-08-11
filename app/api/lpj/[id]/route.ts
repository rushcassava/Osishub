import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return jsonError("ID tidak valid.");

  try {
    const existing = await prisma.lpj.findUnique({ where: { id_lpj: id } });
    if (!existing) return jsonError("LPJ tidak ditemukan.", 404);

    const body = await req.json();
    const { status, catatan } = body;

    const allowed = ["DIAJUKAN", "DIREVIEW", "DISAHKAN", "DITOLAK"];
    if (status && !allowed.includes(status)) return jsonError("Status LPJ tidak valid.");

    const data: any = {};
    if (status) data.status = status;
    if (catatan !== undefined) data.catatan = catatan;
    if (status === "DISAHKAN" || status === "DITOLAK" || status === "DIREVIEW") {
      data.reviewer_id = session.id;
      data.direviewPada = new Date();
    }

    const updated = await prisma.lpj.update({
      where: { id_lpj: id },
      data,
    });
    return NextResponse.json({ lpj: updated });
  } catch (err) {
    console.error("Error updating lpj:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

