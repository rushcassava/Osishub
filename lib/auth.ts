import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "osishub_session";

const secretKey = process.env.SESSION_SECRET || "ganti-secret-ini-di-file-env";
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  id: number;
  username: string;
  nama: string;
  peran: "ANGGOTA" | "PERWAKILAN_KELAS" | "PENGURUS" | "PEMBINA";
};

// Membuat token JWT berisi data sesi, berlaku 7 hari.
export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

// Memverifikasi token JWT. Dipakai baik di middleware (edge) maupun API route.
export async function verifySession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Helper untuk dipakai di Server Component / Route Handler (butuh next/headers).
export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

// Menentukan halaman dashboard sesuai peran.
export function dashboardPathForRole(peran: SessionPayload["peran"]) {
  if (peran === "ANGGOTA") return "/dashboard/anggota";
  if (peran === "PERWAKILAN_KELAS") return "/dashboard/perwakilan";
  return "/dashboard/pengurus"; // PENGURUS & PEMBINA berbagi dashboard yang sama
}
