
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

// GET: Menampilkan semua divisi
export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const divisi = await prisma.divisi.findMany({
      orderBy: { nama_divisi: "asc" },
    });

    return NextResponse.json({ divisi });
  } catch (err) {
    console.error("Error fetching divisi:", err);
    return jsonError("Gagal mengambil data divisi.", 500);
  }
}

// POST: Menambahkan divisi
export async function POST(req: NextRequest) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const { nama_divisi } = await req.json();

    if (!nama_divisi || !nama_divisi.trim()) {
      return jsonError("Nama divisi wajib diisi.");
    }

    const nama = nama_divisi.trim();

    const existing = await prisma.divisi.findUnique({
      where: { nama_divisi: nama },
    });

    if (existing) {
      return jsonError("Nama divisi sudah tersedia.", 409);
    }

    const created = await prisma.divisi.create({
      data: { nama_divisi: nama },
    });

    return NextResponse.json({ divisi: created }, { status: 201 });
  } catch (err) {
    console.error("Error creating divisi:", err);
    return jsonError("Gagal menambahkan divisi.", 500);
  }
}
