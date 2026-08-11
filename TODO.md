# TODO — Fitur Manajemen Akun untuk Pengurus/Pembina

## Langkah Implementasi

- [x] 0. Analisis proyek & rencana (disetujui user)
- [x] 1. Buat API `app/api/pengguna/route.ts` — GET (daftar pengguna) + POST (buat akun), hanya PENGURUS & PEMBINA
- [x] 2. Buat API `app/api/pengguna/[id]/route.ts` — PATCH (reset sandi / update) + DELETE (hapus akun)
- [x] 3. Update `app/api/auth/login/route.ts` — dukung password bcrypt (tetap kompatibel dengan plaintext lama)
- [x] 4. Buat komponen `components/modules/PenggunaModule.tsx` — form buat akun + tabel daftar pengguna + reset sandi + hapus
- [x] 5. Buat halaman `app/dashboard/pengurus/pengguna/page.tsx`
- [x] 6. Update `prisma/seed.ts` — modul "Manajemen Akun" (slug: pengguna) via `add-module-pengguna.ts`
- [x] 7. Jalankan `npm run db:seed` + verifikasi `npm run build` ✅ (build: 39 pages, compiled successfully)
