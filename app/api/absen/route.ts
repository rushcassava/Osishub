import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!session) return jsonError("Tidak terautentikasi.", 401);

  try {
    // Jalankan kedua query secara paralel agar lebih cepat dan efisien
    const [absensi, poinRows] = await Promise.all([
      prisma.absensi.findMany({
        where: { pengguna_id: session.id },
        orderBy: { waktuHadir: "desc" },
        include: { event: { select: { judul: true, tanggal: true } } },
      }),
      prisma.poinKeaktifan.findMany({
        where: { pengguna_id: session.id },
        orderBy: { dibuatPada: "desc" },
      }),
    ]);

    const totalPoin = poinRows.reduce((sum, p) => sum + p.jumlah, 0);
    const totalHadir = absensi.filter((a) => a.hadir).length;

    return NextResponse.json({
      absensi,
      poin: poinRows,
      totalPoin,
      totalHadir,
    });
  } catch (err) {
    console.error("Error fetching absen:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}