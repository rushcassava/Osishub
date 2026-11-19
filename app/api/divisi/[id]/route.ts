
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

// PATCH: Mengedit nama divisi
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const { id } = await params;
    const divisiId = Number(id);

    if (!Number.isInteger(divisiId) || divisiId <= 0) {
      return jsonError("ID divisi tidak valid.", 400);
    }

    const existing = await prisma.divisi.findUnique({
      where: { id_divisi: divisiId },
    });

    if (!existing) {
      return jsonError("Divisi tidak ditemukan.", 404);
    }

    const body = await req.json();

    if (
      typeof body.nama_divisi !== "string" ||
      !body.nama_divisi.trim()
    ) {
      return jsonError("Nama divisi wajib diisi.", 400);
    }

    const nama = body.nama_divisi.trim();

    const duplicate = await prisma.divisi.findFirst({
      where: {
        nama_divisi: nama,
        NOT: { id_divisi: divisiId },
      },
    });

    if (duplicate) {
      return jsonError("Nama divisi sudah digunakan.", 409);
    }

    const updated = await prisma.divisi.update({
      where: { id_divisi: divisiId },
      data: { nama_divisi: nama },
    });

    return NextResponse.json({
      message: "Divisi berhasil diperbarui.",
      divisi: updated,
    });
  } catch (err) {
    console.error("Error updating divisi:", err);
    return jsonError("Gagal memperbarui divisi.", 500);
  }
}

// DELETE: Menghapus divisi
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const { id } = await params;
    const divisiId = Number(id);

    if (!Number.isInteger(divisiId) || divisiId <= 0) {
      return jsonError("ID divisi tidak valid.", 400);
    }

    const existing = await prisma.divisi.findUnique({
      where: { id_divisi: divisiId },
    });

    if (!existing) {
      return jsonError("Divisi tidak ditemukan.", 404);
    }

    const [jumlahProker, jumlahLpj] = await Promise.all([
      prisma.proker.count({
        where: { divisi_id: divisiId },
      }),
      prisma.lpj.count({
        where: { divisi_id: divisiId },
      }),
    ]);

    if (jumlahProker > 0 || jumlahLpj > 0) {
      return jsonError(
        "Divisi tidak dapat dihapus karena masih digunakan oleh Proker atau LPJ.",
        409
      );
    }

    await prisma.divisi.delete({
      where: { id_divisi: divisiId },
    });

    return NextResponse.json({
      message: "Divisi berhasil dihapus.",
    });
  } catch (err) {
    console.error("Error deleting divisi:", err);
    return jsonError("Gagal menghapus divisi.", 500);
  }
}
