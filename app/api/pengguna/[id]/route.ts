import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";
import bcrypt from "bcryptjs";

const VALID_ROLES = ["ANGGOTA", "PERWAKILAN_KELAS", "PENGURUS", "PEMBINA"] as const;

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  if (Number.isNaN(id)) return jsonError("ID tidak valid.");

  try {
    const existing = await prisma.pengguna.findUnique({ where: { id_pengguna: id } });
    if (!existing) return jsonError("Pengguna tidak ditemukan.", 404);

    const body = await req.json();
    const { password, nama, peran, kelas, jabatan, username } = body;

    const data: any = {};

    if (nama !== undefined) {
      if (!nama.trim()) return jsonError("Nama tidak boleh kosong.");
      data.nama = nama.trim();
    }

    if (peran !== undefined) {
      if (!VALID_ROLES.includes(peran)) return jsonError("Peran tidak valid.");
      data.peran = peran;
    }

    if (kelas !== undefined) data.kelas = kelas || null;
    if (jabatan !== undefined) data.jabatan = jabatan || null;

    if (username !== undefined && username !== existing.username) {
      if (typeof username !== "string" || username.trim().length < 3) {
        return jsonError("Username minimal 3 karakter.");
      }
      const conflict = await prisma.pengguna.findUnique({ where: { username: username.trim() } });
      if (conflict && conflict.id_pengguna !== id) {
        return jsonError("Username sudah digunakan.");
      }
      data.username = username.trim();
    }

    // Reset sandi
    if (password !== undefined && password !== "") {
      if (typeof password !== "string" || password.length < 6) {
        return jsonError("Password minimal 6 karakter.");
      }
      data.password = await bcrypt.hash(password, 10);
    }

    // Cegah mengubah/menonaktifkan akun sendiri (agar tidak terkunci)
    if (id === session.id && (peran !== undefined || password !== undefined)) {
      return jsonError("Tidak dapat mengubah peran atau password akun sendiri.", 403);
    }

    const updated = await prisma.pengguna.update({
      where: { id_pengguna: id },
      data,
      select: {
        id_pengguna: true,
        username: true,
        nama: true,
        peran: true,
        kelas: true,
        jabatan: true,
        dibuatPada: true,
      },
    });

    return NextResponse.json({
      pengguna: updated,
      message: password ? "Password berhasil di-reset." : "Data akun berhasil diperbarui.",
    });
  } catch (err) {
    console.error("Error updating pengguna:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  if (Number.isNaN(id)) return jsonError("ID tidak valid.");

  try {
    if (id === session.id) {
      return jsonError("Tidak dapat menghapus akun sendiri.", 403);
    }

    const existing = await prisma.pengguna.findUnique({ where: { id_pengguna: id } });
    if (!existing) return jsonError("Pengguna tidak ditemukan.", 404);

    // Cek apakah pengguna memiliki data terkait — jika ya, beri pesan jelas
    const related = await prisma.pengguna.findUnique({
      where: { id_pengguna: id },
      select: {
        _count: {
          select: {
            aspirasi: true,
            registrasi: true,
            absensi: true,
            poin: true,
            transaksi: true,
            prokerDibuat: true,
            arsipDibuat: true,
            lpjDibuat: true,
          },
        },
      },
    });

    const totalRelated =
      (related?._count.aspirasi ?? 0) +
      (related?._count.registrasi ?? 0) +
      (related?._count.absensi ?? 0) +
      (related?._count.poin ?? 0) +
      (related?._count.transaksi ?? 0) +
      (related?._count.prokerDibuat ?? 0) +
      (related?._count.arsipDibuat ?? 0) +
      (related?._count.lpjDibuat ?? 0);

    if (totalRelated > 0) {
      return jsonError(
        `Akun ${existing.nama} memiliki ${totalRelated} data terkait (aspirasi, event, arsip, dll). Nonaktifkan secara manual di database jika tetap ingin menghapus.`,
        409
      );
    }

    await prisma.pengguna.delete({ where: { id_pengguna: id } });
    return NextResponse.json({ success: true, message: `Akun ${existing.nama} berhasil dihapus.` });
  } catch (err) {
    console.error("Error deleting pengguna:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}