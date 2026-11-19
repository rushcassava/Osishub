-- CreateEnum
CREATE TYPE "Peran" AS ENUM ('ANGGOTA', 'PERWAKILAN_KELAS', 'PENGURUS', 'PEMBINA');

-- CreateEnum
CREATE TYPE "ModuleStatus" AS ENUM ('AKTIF', 'SEGERA_HADIR', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "StatusAspirasi" AS ENUM ('MENUNGGU', 'DITINJAU', 'DISETUJUI', 'DITINDAKLANJUTI', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusProker" AS ENUM ('RENCANA', 'BERJALAN', 'SELESAI', 'DITUNDA');

-- CreateEnum
CREATE TYPE "JenisTransaksi" AS ENUM ('PEMASUKAN', 'PENGELUARAN');

-- CreateEnum
CREATE TYPE "StatusLpj" AS ENUM ('DIAJUKAN', 'DIREVIEW', 'DISAHKAN', 'DITOLAK');

-- CreateTable
CREATE TABLE "pengguna" (
    "id_pengguna" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "peran" "Peran" NOT NULL,
    "kelas" TEXT,
    "jabatan" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id_pengguna")
);

-- CreateTable
CREATE TABLE "module" (
    "id_module" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "slug" TEXT,
    "peran" "Peran" NOT NULL,
    "status" "ModuleStatus" NOT NULL DEFAULT 'SEGERA_HADIR',
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_pkey" PRIMARY KEY ("id_module")
);

-- CreateTable
CREATE TABLE "feature" (
    "id_feature" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "icon_type" TEXT NOT NULL,
    "icon_path" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_pkey" PRIMARY KEY ("id_feature")
);

-- CreateTable
CREATE TABLE "statistic" (
    "id_statistic" SERIAL NOT NULL,
    "angka" TEXT NOT NULL,
    "suffix" TEXT NOT NULL DEFAULT '',
    "label" TEXT NOT NULL DEFAULT '',
    "deskripsi" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statistic_pkey" PRIMARY KEY ("id_statistic")
);

-- CreateTable
CREATE TABLE "landing_role" (
    "id_landing_role" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "item1" TEXT NOT NULL,
    "item2" TEXT NOT NULL,
    "item3" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_role_pkey" PRIMARY KEY ("id_landing_role")
);

-- CreateTable
CREATE TABLE "testimonial" (
    "id_testimonial" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "peran" TEXT NOT NULL,
    "kutipan" TEXT NOT NULL,
    "avatar_inisial" TEXT NOT NULL DEFAULT '',
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonial_pkey" PRIMARY KEY ("id_testimonial")
);

-- CreateTable
CREATE TABLE "aspirasi" (
    "id_aspirasi" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'Umum',
    "status" "StatusAspirasi" NOT NULL DEFAULT 'MENUNGGU',
    "penulis_id" INTEGER NOT NULL,
    "kelas" TEXT,
    "balasan" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aspirasi_pkey" PRIMARY KEY ("id_aspirasi")
);

-- CreateTable
CREATE TABLE "event" (
    "id_event" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "lokasi" TEXT NOT NULL,
    "qr_code" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id_event")
);

-- CreateTable
CREATE TABLE "proker" (
    "id_proker" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "divisi" TEXT NOT NULL,
    "divisi_id" INTEGER,
    "status" "StatusProker" NOT NULL DEFAULT 'RENCANA',
    "targetSelesai" TIMESTAMP(3),
    "pembuat_id" INTEGER NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proker_pkey" PRIMARY KEY ("id_proker")
);

-- CreateTable
CREATE TABLE "divisi" (
    "id_divisi" SERIAL NOT NULL,
    "nama_divisi" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "divisi_pkey" PRIMARY KEY ("id_divisi")
);

-- CreateTable
CREATE TABLE "transaksi_keuangan" (
    "id_transaksi" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "jumlah" DECIMAL(12,2) NOT NULL,
    "jenis" "JenisTransaksi" NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'Umum',
    "keterangan" TEXT,
    "dicatat_oleh" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaksi_keuangan_pkey" PRIMARY KEY ("id_transaksi")
);

-- CreateTable
CREATE TABLE "absensi" (
    "id_absensi" SERIAL NOT NULL,
    "pengguna_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "hadir" BOOLEAN NOT NULL DEFAULT false,
    "waktuHadir" TIMESTAMP(3),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "absensi_pkey" PRIMARY KEY ("id_absensi")
);

-- CreateTable
CREATE TABLE "poin_keaktifan" (
    "id_poin" SERIAL NOT NULL,
    "pengguna_id" INTEGER NOT NULL,
    "event_id" INTEGER,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "keterangan" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poin_keaktifan_pkey" PRIMARY KEY ("id_poin")
);

-- CreateTable
CREATE TABLE "arsip" (
    "id_arsip" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'Umum',
    "deskripsi" TEXT,
    "file_nama" TEXT,
    "url" TEXT,
    "pembuat_id" INTEGER NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arsip_pkey" PRIMARY KEY ("id_arsip")
);

-- CreateTable
CREATE TABLE "lpj" (
    "id_lpj" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "divisi_id" INTEGER,
    "status" "StatusLpj" NOT NULL DEFAULT 'DIAJUKAN',
    "pembuat_id" INTEGER NOT NULL,
    "reviewer_id" INTEGER,
    "catatan" TEXT,
    "diajukanPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "direviewPada" TIMESTAMP(3),

    CONSTRAINT "lpj_pkey" PRIMARY KEY ("id_lpj")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_username_key" ON "pengguna"("username");

-- CreateIndex
CREATE UNIQUE INDEX "event_qr_code_key" ON "event"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "divisi_nama_divisi_key" ON "divisi"("nama_divisi");

-- CreateIndex
CREATE UNIQUE INDEX "absensi_pengguna_id_event_id_key" ON "absensi"("pengguna_id", "event_id");

-- AddForeignKey
ALTER TABLE "aspirasi" ADD CONSTRAINT "aspirasi_penulis_id_fkey" FOREIGN KEY ("penulis_id") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proker" ADD CONSTRAINT "proker_pembuat_id_fkey" FOREIGN KEY ("pembuat_id") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proker" ADD CONSTRAINT "proker_divisi_id_fkey" FOREIGN KEY ("divisi_id") REFERENCES "divisi"("id_divisi") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_keuangan" ADD CONSTRAINT "transaksi_keuangan_dicatat_oleh_fkey" FOREIGN KEY ("dicatat_oleh") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id_event") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poin_keaktifan" ADD CONSTRAINT "poin_keaktifan_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poin_keaktifan" ADD CONSTRAINT "poin_keaktifan_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id_event") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arsip" ADD CONSTRAINT "arsip_pembuat_id_fkey" FOREIGN KEY ("pembuat_id") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lpj" ADD CONSTRAINT "lpj_pembuat_id_fkey" FOREIGN KEY ("pembuat_id") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lpj" ADD CONSTRAINT "lpj_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "pengguna"("id_pengguna") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lpj" ADD CONSTRAINT "lpj_divisi_id_fkey" FOREIGN KEY ("divisi_id") REFERENCES "divisi"("id_divisi") ON DELETE SET NULL ON UPDATE CASCADE;
