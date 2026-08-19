import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";
import bcrypt from "bcryptjs";

const VALID_ROLES = ["ANGGOTA", "PERWAKILAN_KELAS", "PENGURUS", "PEMBINA"] as const;

export async function GET() {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const pengguna = await prisma.pengguna.findMany({
      orderBy: { dibuatPada: "desc" },
      select: {
        id_pengguna: true,
        username: true,
        nama: true,
        peran: true,
        kelas: true,
        jabatan: true,
        dibuatPada: true,
        _count: {
          select: {
            aspirasi: true,
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

    return NextResponse.json({ pengguna, session });
  } catch (err) {
    console.error("Error fetching pengguna:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const body = await req.json();
    const { username, password, nama, peran, kelas, jabatan } = body;

    // Validasi field wajib
    if (!username || !password || !nama || !peran) {
      return jsonError("Username, password, nama, dan peran wajib diisi.");
    }

    if (typeof username !== "string" || username.trim().length < 3) {
      return jsonError("Username minimal 3 karakter.");
    }
    if (typeof password !== "string" || password.length < 6) {
      return jsonError("Password minimal 6 karakter.");
    }
    if (!VALID_ROLES.includes(peran)) {
      return jsonError("Peran tidak valid.");
    }

    // Username harus unik
    const existing = await prisma.pengguna.findUnique({ where: { username } });
    if (existing) {
      return jsonError("Username sudah digunakan. Pilih username lain.");
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await prisma.pengguna.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        nama: nama.trim(),
        peran,
        kelas: kelas || null,
        jabatan: jabatan || null,
      },
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

    return NextResponse.json(
      { pengguna: created, message: `Akun ${created.username} berhasil dibuat.` },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating pengguna:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

