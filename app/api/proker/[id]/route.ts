
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";
import { StatusProker } from "@prisma/client";

// GET: Menampilkan detail Proker
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const { id } = await context.params;
    const idProker = Number(id);

    if (!Number.isInteger(idProker) || idProker <= 0) {
      return jsonError("ID Proker tidak valid.", 400);
    }

    const proker = await prisma.proker.findUnique({
      where: { id_proker: idProker },
      include: {
        pembuat: {
          select: { nama: true },
        },
        divisiMaster: true,
      },
    });

    if (!proker) {
      return jsonError("Proker tidak ditemukan.", 404);
    }

    return NextResponse.json({ proker });
  } catch (err) {
    console.error("Error fetching Proker:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

// PATCH: Mengubah status Proker
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const { id } = await context.params;
    const idProker = Number(id);

    if (!Number.isInteger(idProker) || idProker <= 0) {
      return jsonError("ID Proker tidak valid.", 400);
    }

    const body = await req.json();
    const { status } = body;

    const statusValid = Object.values(StatusProker);

    if (
      typeof status !== "string" ||
      !statusValid.includes(status as StatusProker)
    ) {
      return jsonError("Status Proker tidak valid.", 400);
    }

    const existing = await prisma.proker.findUnique({
      where: { id_proker: idProker },
    });

    if (!existing) {
      return jsonError("Proker tidak ditemukan.", 404);
    }

    const updated = await prisma.proker.update({
      where: { id_proker: idProker },
      data: {
        status: status as StatusProker,
      },
      include: {
        pembuat: {
          select: { nama: true },
        },
        divisiMaster: true,
      },
    });

    return NextResponse.json({
      message: "Status Proker berhasil diperbarui.",
      proker: updated,
    });
  } catch (err) {
    console.error("Error updating Proker:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

// DELETE: Menghapus Proker
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const { id } = await context.params;
    const idProker = Number(id);

    if (!Number.isInteger(idProker) || idProker <= 0) {
      return jsonError("ID Proker tidak valid.", 400);
    }

    const existing = await prisma.proker.findUnique({
      where: { id_proker: idProker },
    });

    if (!existing) {
      return jsonError("Proker tidak ditemukan.", 404);
    }

    if (
      existing.status !== StatusProker.RENCANA &&
      existing.status !== StatusProker.DITUNDA
    ) {
      return jsonError(
        "Proker yang sedang berjalan atau sudah selesai tidak dapat dihapus.",
        400
      );
    }

    await prisma.proker.delete({
      where: { id_proker: idProker },
    });

    return NextResponse.json({
      message: "Proker berhasil dihapus.",
    });
  } catch (err) {
    console.error("Error deleting Proker:", err);
    return jsonError("Terjadi kesalahan saat menghapus Proker.", 500);
  }
}
