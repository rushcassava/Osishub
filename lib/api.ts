import { NextResponse } from "next/server";
import { getSession, SessionPayload } from "./auth";

/**
 * Memastikan pengguna terautentikasi (opsional: dengan peran tertentu).
 * Mengembalikan objek { error, session } — jika `error` tidak null,
 * langsung return `error` (NextResponse) dari route handler.
 *
 * Return type dibuat sebagai discriminated union agar TypeScript bisa
 * mempersempit `session` menjadi non-null setelah `if (error) return error`.
 */
export async function requireSession(
  roles?: SessionPayload["peran"][]
): Promise<
  | { error: NextResponse; session: null }
  | { error: null; session: SessionPayload }
> {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 }),
      session: null,
    };
  }
  if (roles && !roles.includes(session.peran)) {
    return {
      error: NextResponse.json(
        { error: "Akses ditolak untuk peran ini." },
        { status: 403 }
      ),
      session: null,
    };
  }
  return { error: null, session };
}

export function jsonError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

