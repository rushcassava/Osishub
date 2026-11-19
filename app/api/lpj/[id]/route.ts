
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET: mengambil detail LPJ
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);

  if (Number.isNaN(id)) {
    return jsonError("ID LPJ tidak valid.");
  }

  try {
    const lpj = await prisma.lpj.findUnique({
      where: { id_lpj: id },
      include: {
        pembuat: { select: { nama: true } },
        reviewer: { select: { nama: true } },
      },
    });

    if (!lpj) {
      return jsonError("LPJ tidak ditemukan.", 404);
    }

    const isPengurus = session.peran === "PENGURUS";
    const isPembina = session.peran === "PEMBINA";
    const isOwner = lpj.pembuat_id === session.id;

    const canView = isPengurus || isPembina || isOwner;
    const canEdit =
      isPengurus &&
      isOwner &&
      lpj.status !== "DISAHKAN";

    if (!canView) {
      return jsonError("Kamu tidak memiliki akses ke LPJ ini.", 403);
    }

    return NextResponse.json({
      lpj,
      permissions: {
        canEdit,
        canReview: isPembina,
      },
    });
  } catch (err) {
    console.error("Error fetching LPJ detail:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

// PATCH: mengedit LPJ atau melakukan review
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);

  if (Number.isNaN(id)) {
    return jsonError("ID LPJ tidak valid.");
  }

  try {
    const existing = await prisma.lpj.findUnique({
      where: { id_lpj: id },
    });

    if (!existing) {
      return jsonError("LPJ tidak ditemukan.", 404);
    }

    const body = await req.json();

    const isPengurus = session.peran === "PENGURUS";
    const isPembina = session.peran === "PEMBINA";
    const isOwner = existing.pembuat_id === session.id;

    // MODE EDIT: hanya Pengurus pembuat LPJ
    if (body.judul !== undefined || body.isi !== undefined) {
      if (!isPengurus || !isOwner) {
        return jsonError(
          "Hanya Pengurus pembuat LPJ yang dapat mengedit laporan ini.",
          403
        );
      }

      if (existing.status === "DISAHKAN") {
        return jsonError(
          "LPJ yang sudah disahkan tidak dapat diedit.",
          403
        );
      }

      if (
        typeof body.judul !== "string" ||
        typeof body.isi !== "string" ||
        !body.judul.trim() ||
        !body.isi.trim()
      ) {
        return jsonError("Judul dan isi LPJ wajib diisi.");
      }

      const updated = await prisma.lpj.update({
        where: { id_lpj: id },
        data: {
          judul: body.judul.trim(),
          isi: body.isi.trim(),
          status: "DIAJUKAN",
          reviewer_id: null,
          direviewPada: null,
          catatan: null,
        },
      });

      return NextResponse.json({
        message: "LPJ berhasil diperbarui dan diajukan kembali.",
        lpj: updated,
      });
    }

    // MODE REVIEW: hanya Pembina OSIS
    if (!isPembina) {
      return jsonError(
        "Hanya Pembina OSIS yang memiliki wewenang melakukan review LPJ.",
        403
      );
    }

    if (
      existing.status === "DISAHKAN" ||
      existing.status === "DITOLAK"
    ) {
      return jsonError(
        "LPJ dengan status final tidak dapat direview kembali.",
        403
      );
    }

    const allowed = [
      "DIREVIEW",
      "DISAHKAN",
      "DITOLAK",
    ];

    if (!allowed.includes(body.status)) {
      return jsonError("Status review LPJ tidak valid.");
    }

    const updated = await prisma.lpj.update({
      where: { id_lpj: id },
      data: {
        status: body.status,
        catatan:
          typeof body.catatan === "string"
            ? body.catatan
            : existing.catatan,
        reviewer_id: session.id,
        direviewPada: new Date(),
      },
    });

    return NextResponse.json({
      message: "Review LPJ berhasil diperbarui.",
      lpj: updated,
    });
  } catch (err) {
    console.error("Error updating LPJ:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}
