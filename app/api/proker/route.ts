import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const proker = await prisma.proker.findMany({
      orderBy: [{ status: "asc" }, { dibuatPada: "desc" }],
      include: {
        pembuat: { select: { nama: true } },
      },
    });
    return NextResponse.json({ proker });
  } catch (err) {
    console.error("Error fetching proker:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const { judul, deskripsi, divisi, status, targetSelesai } = await req.json();
    if (!judul || !deskripsi || !divisi) {
      return jsonError("Judul, deskripsi, dan divisi wajib diisi.");
    }

    const created = await prisma.proker.create({
      data: {
        judul,
        deskripsi,
        divisi,
        status: status || "RENCANA",
        targetSelesai: targetSelesai ? new Date(targetSelesai) : null,
        pembuat_id: session.id,
      },
    });

    return NextResponse.json({ proker: created }, { status: 201 });
  } catch (err) {
    console.error("Error creating proker:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

