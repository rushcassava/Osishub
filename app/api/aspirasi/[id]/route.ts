
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  // Mengambil ID aspirasi
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (Number.isNaN(id)) {
    return jsonError("ID tidak valid.");
  }

  // Hanya PENGURUS yang boleh mengelola aspirasi
  if (session.peran !== "PENGURUS") {
    return jsonError(
      "Akses ditolak. Hanya Pengurus yang dapat mengelola aspirasi.",
      403
    );
  }

  try {
    const existing = await prisma.aspirasi.findUnique({
      where: { id_aspirasi: id },
    });

    if (!existing) {
      return jsonError("Aspirasi tidak ditemukan.", 404);
    }

    const body = await req.json();

    const { status, balasan, alasan_penolakan } = body;

    const data: {
      status?: typeof existing.status;
      balasan?: string | null;
      alasan_penolakan?: string | null;
    } = {};

    // Validasi perubahan status
    if (status !== undefined) {
      const allowedTransitions: Record<string, string[]> = {
        MENUNGGU: ["DITINJAU"],
        DITINJAU: ["DISETUJUI", "DITOLAK"],
        DISETUJUI: ["DITINDAKLANJUTI"],
        DITINDAKLANJUTI: ["SELESAI"],
        SELESAI: [],
        DITOLAK: [],
      };

      const allowed = allowedTransitions[existing.status];

      if (!allowed || !allowed.includes(status)) {
        return jsonError(
          `Perubahan status dari ${existing.status} ke ${status} tidak diizinkan.`,
          400
        );
      }

      data.status = status as typeof existing.status;

      // Jika aspirasi ditolak, alasan wajib diisi
      if (status === "DITOLAK") {
        if (
          typeof alasan_penolakan !== "string" ||
          !alasan_penolakan.trim()
        ) {
          return jsonError(
            "Alasan penolakan wajib diisi."
          );
        }

        data.alasan_penolakan = alasan_penolakan.trim();
      }

      // Bersihkan alasan penolakan jika aspirasi disetujui
      if (status === "DISETUJUI") {
        data.alasan_penolakan = null;
      }
    }

    // Memperbarui balasan atau progres
    if (balasan !== undefined) {
      if (existing.status !== "DITINDAKLANJUTI") {
        return jsonError(
          "Balasan atau progres hanya dapat diperbarui saat aspirasi ditindaklanjuti."
        );
      }

      if (typeof balasan !== "string") {
        return jsonError("Format balasan tidak valid.");
      }

      data.balasan = balasan.trim();
    }

    if (Object.keys(data).length === 0) {
      return jsonError("Tidak ada perubahan yang dikirim.");
    }

    const updated = await prisma.aspirasi.update({
      where: { id_aspirasi: id },
      data,
    });

    return NextResponse.json({
      message: "Aspirasi berhasil diperbarui.",
      aspirasi: updated,
    });
  } catch (err) {
    console.error("Error updating aspirasi:", err);

    return jsonError(
      "Terjadi kesalahan pada server.",
      500
    );
  }
}
