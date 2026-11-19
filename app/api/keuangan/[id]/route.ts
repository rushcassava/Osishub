
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const resolvedParams = await params;
  const id = Number.parseInt(resolvedParams.id, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return jsonError("ID tidak valid.");
  }

  try {
    const existing = await prisma.transaksiKeuangan.findUnique({
      where: { id_transaksi: id },
    });

    if (!existing) {
      return jsonError("Transaksi tidak ditemukan.", 404);
    }

    const body = await req.json();
    const { judul, jumlah, jenis, kategori, keterangan } = body;

    if (typeof judul !== "string" || !judul.trim()) {
      return jsonError("Judul transaksi wajib diisi.");
    }

    if (
      jumlah === undefined ||
      jumlah === null ||
      jumlah === "" ||
      !Number.isFinite(Number(jumlah)) ||
      Number(jumlah) < 0
    ) {
      return jsonError("Jumlah transaksi tidak valid.");
    }

    if (jenis !== "PEMASUKAN" && jenis !== "PENGELUARAN") {
      return jsonError("Jenis transaksi tidak valid.");
    }

    if (typeof kategori !== "string" || !kategori.trim()) {
      return jsonError("Kategori wajib diisi.");
    }

    if (
      kategori === "Lainnya" &&
      (typeof keterangan !== "string" || !keterangan.trim())
    ) {
      return jsonError("Keterangan wajib diisi untuk kategori Lainnya.");
    }

    const updated = await prisma.transaksiKeuangan.update({
      where: { id_transaksi: id },
      data: {
        judul: judul.trim(),
        jumlah: Number(jumlah),
        jenis,
        kategori: kategori.trim(),
        keterangan:
          typeof keterangan === "string" && keterangan.trim()
            ? keterangan.trim()
            : null,
      },
      include: {
        pencatat: {
          select: { nama: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      transaksi: updated,
    });
  } catch (err) {
    console.error("Error updating transaksi:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const resolvedParams = await params;
  const id = Number.parseInt(resolvedParams.id, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return jsonError("ID tidak valid.");
  }

  try {
    const existing = await prisma.transaksiKeuangan.findUnique({
      where: { id_transaksi: id },
    });

    if (!existing) {
      return jsonError("Transaksi tidak ditemukan.", 404);
    }

    await prisma.transaksiKeuangan.delete({
      where: { id_transaksi: id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting transaksi:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}
