<<<<<<< HEAD
# OSIS-Hub — Next.js

Website OSIS-Hub, dibangun dengan Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, dan MySQL.

Fitur yang sudah **berfungsi penuh**: Login & Peran Pengguna (Anggota, Perwakilan Kelas, Pengurus/Pembina), dengan dashboard terpisah per peran dan proteksi halaman otomatis.

Fitur lain (Aspirasi, Agenda, Keuangan, dll) masih tampilan landing page statis — dashboard sudah menyediakan tempat ("Segera hadir") untuk dibangun berikutnya.

## 1. Prasyarat

- Node.js 18+ 
- Laragon aktif dengan **MySQL** dinyalakan

## 2. Install dependency

```bash
npm install
```

## 3. Siapkan database

1. Buka Laragon, klik kanan tray icon Laragon → **MySQL** → pastikan servicenya jalan (hijau).
2. Buka HeidiSQL (lewat menu Laragon → Database) atau phpMyAdmin.
3. Buat database baru dengan nama `osis_hub` (kosong saja, tabelnya dibuat otomatis oleh Prisma).

## 4. Siapkan file environment

Salin `.env.example` menjadi `.env`:

```bash
copy .env.example .env
```

Isi `DATABASE_URL` di file `.env` sesuaikan dengan setup MySQL kamu (default Laragon biasanya sudah cocok: user `root`, tanpa password, port `3306`).

## 5. Buat tabel & isi akun demo

```bash
npm run db:push
npm run db:seed
```

Setelah ini akan tersedia 3 akun demo (password semuanya `password123`):

| Username        | Peran              |
|------------------|---------------------|
| `anggota01`      | Anggota OSIS        |
| `perwakilan01`   | Perwakilan Kelas    |
| `pengurus01`     | Pengurus            |

## 6. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000, klik **Masuk**, lalu login dengan salah satu akun demo di atas. Kamu akan diarahkan ke dashboard sesuai peran.

## Struktur folder

```
app/
  layout.tsx, page.tsx, globals.css   -> landing page
  login/                              -> halaman login
  dashboard/                          -> area setelah login (per peran)
  api/auth/                           -> route login & logout
components/                           -> section landing page + ModuleCard
lib/
  prisma.ts                           -> koneksi database
  auth.ts                             -> sesi login (JWT + cookie)
prisma/
  schema.prisma                       -> struktur tabel database
  seed.ts                             -> akun demo
middleware.ts                         -> proteksi halaman /dashboard
```

## Menambah pengguna baru

Untuk sekarang, akun dibuat lewat `prisma/seed.ts` atau langsung lewat Prisma Studio:

```bash
npm run db:studio
```

Ini membuka editor database di browser — kamu bisa tambah baris baru di tabel `pengguna` secara manual. **Ingat:** kolom `password` harus berisi hash bcrypt, bukan teks biasa. Cara termudah adalah menambahkannya lewat `prisma/seed.ts` lalu jalankan `npm run db:seed` lagi.

## Build untuk production

```bash
npm run build
npm run start
```
=======
# Osishub
>>>>>>> 11d940d95dca407ce45c8ebe9551df7c0e87e966
