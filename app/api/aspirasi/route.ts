
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");

  try {
    let where: any = {};

    if (session.peran === "PERWAKILAN_KELAS") {
      // Ambil kelas langsung dari database, bukan dari JWT.
      const pengguna = await prisma.pengguna.findUnique({
        where: { id_pengguna: session.id },
        select: { kelas: true },
      });

      if (!pengguna?.kelas?.trim()) {
        return jsonError(
          "Data kelas akun belum diisi. Hubungi Pengurus.",
          400
        );
      }

      where = { kelas: pengguna.kelas.trim() };

      if (filter === "saya") {
        where = { penulis_id: session.id };
      }
    } else if (session.peran === "ANGGOTA") {
      where = {};
    } else if (session.peran === "PENGURUS") {
      where = {};

      if (filter === "masuk") {
        where = {
          status: {
            in: [
              "MENUNGGU",
              "DITINJAU",
              "DISETUJUI",
              "DITINDAKLANJUTI",
            ],
          },
        };
      }

      if (filter === "saya") {
        where = { penulis_id: session.id };
      }
    } else if (session.peran === "PEMBINA") {
      where = {};
    } else {
      return jsonError("Akses ditolak.", 403);
    }

    const aspirasi = await prisma.aspirasi.findMany({
      where,
      orderBy: { dibuatPada: "desc" },
      include: {
        penulis: {
          select: {
            nama: true,
            kelas: true,
            peran: true,
          },
        },
      },
    });

    return NextResponse.json({ aspirasi });
  } catch (err) {
    console.error("Error fetching aspirasi:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  // Hanya Perwakilan Kelas yang boleh mengirim aspirasi.
  if (session.peran !== "PERWAKILAN_KELAS") {
    return jsonError(
      "Hanya Perwakilan Kelas yang dapat mengirim aspirasi.",
      403
    );
  }

  try {
    const body = await req.json();
    const { judul, isi, kategori } = body;

    if (
      typeof judul !== "string" ||
      !judul.trim() ||
      typeof isi !== "string" ||
      !isi.trim()
    ) {
      return jsonError("Judul dan isi wajib diisi.");
    }

    // Ambil kelas berdasarkan akun yang sedang login.
    const pengguna = await prisma.pengguna.findUnique({
      where: { id_pengguna: session.id },
      select: { kelas: true },
    });

    if (!pengguna?.kelas?.trim()) {
      return jsonError(
        "Data kelas akun belum diisi. Hubungi Pengurus.",
        400
      );
    }

    const created = await prisma.aspirasi.create({
      data: {
        judul: judul.trim(),
        isi: isi.trim(),
        kategori:
          typeof kategori === "string" && kategori.trim()
            ? kategori.trim()
            : "Umum",
        penulis_id: session.id,
        kelas: pengguna.kelas.trim(),
      },
    });

    return NextResponse.json(
      {
        message: "Aspirasi berhasil dikirim.",
        aspirasi: created,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating aspirasi:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}
