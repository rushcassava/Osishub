import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signSession, SESSION_COOKIE, dashboardPathForRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const pengguna = await prisma.pengguna.findUnique({
      where: { username },
    });

    if (!pengguna) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    // Cek password — mendukung bcrypt (akun baru) dan plaintext (akun seed lama)
    let cocok = false;
    const isHashed = pengguna.password.startsWith("$2");
    if (isHashed) {
      cocok = await bcrypt.compare(password, pengguna.password);
    } else {
      cocok = password === pengguna.password;
    }
    if (!cocok) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const token = await signSession({
      id: pengguna.id_pengguna,
      username: pengguna.username,
      nama: pengguna.nama,
      peran: pengguna.peran,
    });

    const response = NextResponse.json({
      success: true,
      redirectTo: dashboardPathForRole(pengguna.peran),
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
