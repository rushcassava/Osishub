import { NextRequest, NextResponse } from "next/server";
import { requireSession, jsonError } from "@/lib/api";
import { SignJWT } from "jose";

const secretKey = process.env.SESSION_SECRET || "ganti-secret-ini-di-file-env";
const encodedKey = new TextEncoder().encode(secretKey);

export async function GET(req: NextRequest) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return jsonError("eventId wajib disertakan.");
  }

  // Buat token JWT berumur pendek (20 detik)
  const token = await new SignJWT({ eventId: parseInt(eventId, 10) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("20s")
    .sign(encodedKey);

  return NextResponse.json({ token });
}
