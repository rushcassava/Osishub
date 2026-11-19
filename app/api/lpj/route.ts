
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

// GET: Mengambil daftar LPJ
export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const lpj = await prisma.lpj.findMany({
      orderBy: { diajukanPada: "desc" },
      include: {
        pembuat: {
          select: { nama: true },
        },
        reviewer: {
          select: { nama: true },
        },
        divisiMaster: true,
      },
    });

    const isPengurus = session.peran === "PENGURUS";
    const isPembina = session.peran === "PEMBINA";

    const data = (
  isPengurus || isPembina
    ? lpj
    : lpj.filter((l) => l.pembuat_id === session.id)
).map((item) => ({
  ...item,
  canEdit:
    isPengurus &&
    item.pembuat_id === session.id &&
    item.status !== "DISAHKAN",
}));

return NextResponse.json({
  lpj: data,
  permissions: {
    canCreate: isPengurus,
    canReview: isPembina,
  },
});
  } catch (err) {
    console.error("Error fetching LPJ:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

// POST: Hanya Pengurus OSIS yang dapat mengajukan LPJ
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession(["PENGURUS"]);
  if (error) return error;

  try {
    const body = await req.json();
    const { judul, isi, divisi_id } = body;

    if (
      typeof judul !== "string" ||
      typeof isi !== "string" ||
      !judul.trim() ||
      !isi.trim()
    ) {
      return jsonError("Judul dan isi LPJ wajib diisi.");
    }

    let idDivisi: number | null = null;

    // Jika frontend mengirim divisi_id, gunakan ID tersebut.
    if (divisi_id !== undefined && divisi_id !== null) {
      const parsedId = Number(divisi_id);

      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return jsonError("ID divisi tidak valid.");
      }

      const divisi = await prisma.divisi.findUnique({
        where: { id_divisi: parsedId },
      });

      if (!divisi) {
        return jsonError("Divisi tidak ditemukan.", 404);
      }

      idDivisi = divisi.id_divisi;
    } else {
      // Kompatibilitas dengan formulir LPJ versi lama.
      // Mencoba membaca baris "Divisi/Sie : Nama Divisi" dari isi LPJ.
      const match = isi.match(/^Divisi\/Sie\s*:\s*(.*?)\s*$/im);

      if (match?.[1]) {
        const namaDivisi = match[1].trim();

        const divisi = await prisma.divisi.findUnique({
          where: { nama_divisi: namaDivisi },
        });

        if (divisi) {
          idDivisi = divisi.id_divisi;
        }
      }
    }

    const created = await prisma.lpj.create({
      data: {
        judul: judul.trim(),
        isi: isi.trim(),
        divisi_id: idDivisi,
        pembuat_id: session.id,
      },
      include: {
        divisiMaster: true,
      },
    });

    return NextResponse.json(
      {
        message: "LPJ berhasil diajukan.",
        lpj: created,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating LPJ:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}
