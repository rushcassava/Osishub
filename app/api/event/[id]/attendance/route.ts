
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

// GET: Mengambil daftar anggota yang hadir dan belum hadir
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (Number.isNaN(id)) {
    return jsonError("ID event tidak valid.");
  }

  try {
    // Periksa apakah event tersedia
    const event = await prisma.event.findUnique({
      where: { id_event: id },
      select: {
        id_event: true,
        judul: true,
        deskripsi: true,
        tanggal: true,
        lokasi: true,
      },
    });

    if (!event) {
      return jsonError("Event tidak ditemukan.", 404);
    }

    // Ambil seluruh akun ANGGOTA
    const anggota = await prisma.pengguna.findMany({
      where: {
        peran: "ANGGOTA",
      },
      select: {
        id_pengguna: true,
        nama: true,
        username: true,
        kelas: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    // Ambil catatan absensi anggota untuk event ini
    const absensi = await prisma.absensi.findMany({
      where: {
        event_id: id,
        pengguna: {
          peran: "ANGGOTA",
        },
      },
      select: {
        pengguna_id: true,
        hadir: true,
        waktuHadir: true,
      },
    });

    // Hubungkan data anggota dengan catatan absensi
    const dataAbsensi = anggota.map((orang) => {
      const catatan = absensi.find(
        (a) => a.pengguna_id === orang.id_pengguna
      );

      const hadir = catatan?.hadir === true;

      return {
        id_pengguna: orang.id_pengguna,
        nama: orang.nama,
        username: orang.username,
        kelas: orang.kelas,
        hadir,
        waktuHadir: hadir ? catatan?.waktuHadir : null,
      };
    });

    const totalAnggota = dataAbsensi.length;

    const totalHadir = dataAbsensi.filter(
      (orang) => orang.hadir
    ).length;

    const totalBelumHadir = totalAnggota - totalHadir;

    return NextResponse.json({
      event,
      statistik: {
        totalAnggota,
        totalHadir,
        totalBelumHadir,
        persentaseKehadiran:
          totalAnggota > 0
            ? Math.round((totalHadir / totalAnggota) * 100)
            : 0,
      },
      anggota: dataAbsensi,
    });
  } catch (err) {
    console.error("[/api/event/[id]/attendance GET] Error:", err);

    return jsonError(
      "Terjadi kesalahan saat mengambil daftar kehadiran.",
      500
    );
  }
}
