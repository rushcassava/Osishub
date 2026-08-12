import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

// CONTOH UNTUK PATCH / DELETE / GET
export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // <-- Ubah jadi Promise
) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  // Wajib gunakan await di Next.js 16
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  
  if (Number.isNaN(id)) return jsonError("ID tidak valid.");

  try {
    // Logika update proker kamu selanjutnya...
    const body = await req.json();
    
    const updated = await prisma.proker.update({
      where: { id_proker: id },
      data: body,
    });

    return NextResponse.json({ proker: updated, message: "Proker berhasil diperbarui." });
  } catch (err) {
    console.error("Error updating proker:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // <-- Ubah jadi Promise
) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (Number.isNaN(id)) return jsonError("ID tidak valid.");

  try {
    await prisma.proker.delete({
      where: { id_proker: id },
    });

    return NextResponse.json({ success: true, message: "Proker berhasil dihapus." });
  } catch (err) {
    console.error("Error deleting proker:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}