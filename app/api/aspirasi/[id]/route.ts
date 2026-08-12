import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // <-- Ubah menjadi Promise
) {
  const { session, error } = await requireSession();
  if (error) return error;

  // Wajib menggunakan await di Next.js 16
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  
  if (Number.isNaN(id)) return jsonError("ID tidak valid.");

  try {
    const existing = await prisma.aspirasi.findUnique({ where: { id_aspirasi: id } });
    if (!existing) return jsonError("Aspirasi tidak ditemukan.", 404);

    const body = await req.json();
    const { status, balasan } = body;

    // Peran dan aksi yang diizinkan
    if (session.peran === "ANGGOTA") {
      // Anggota meninjau: MENUNGGU -> DITINJAU / DISETUJUI / DITOLAK
      const allowed = ["DITINJAU", "DISETUJUI", "DITOLAK"];
      if (status && !allowed.includes(status)) {
        return jsonError("Status tidak diizinkan untuk peran ini.", 403);
      }
      if (!status) return jsonError("Status wajib diisi.");
      const updated = await prisma.aspirasi.update({
        where: { id_aspirasi: id },
        data: { status },
      });
      return NextResponse.json({ aspirasi: updated });
    }

    if (session.peran === "PENGURUS" || session.peran === "PEMBINA") {
      const allowed = ["DITINDAKLANJUTI", "SELESAI"];
      if (status && !allowed.includes(status)) {
        return jsonError("Status tidak diizinkan untuk peran ini.", 403);
      }
      const data: any = {};
      if (status) data.status = status;
      if (balasan !== undefined) data.balasan = balasan;
      const updated = await prisma.aspirasi.update({
        where: { id_aspirasi: id },
        data,
      });
      return NextResponse.json({ aspirasi: updated });
    }

    if (session.peran === "PERWAKILAN_KELAS") {
      // Perwakilan hanya bisa membatalkan aspirasinya sendiri yang masih MENUNGGU
      if (existing.penulis_id !== session.id) return jsonError("Akses ditolak.", 403);
      if (status === "DITOLAK" && existing.status === "MENUNGGU") {
        const updated = await prisma.aspirasi.update({
          where: { id_aspirasi: id },
          data: { status: "DITOLAK" },
        });
        return NextResponse.json({ aspirasi: updated });
      }
      return jsonError("Aksi tidak diizinkan.", 403);
    }

    return jsonError("Peran tidak dikenali.", 403);
  } catch (err) {
    console.error("Error updating aspirasi:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}