
import { PrismaClient, Peran, ModuleStatus } from "@prisma/client";

const prisma = new PrismaClient();

const modules = [
  // ANGGOTA
  {
    judul: "Tinjau Aspirasi Kelas",
    deskripsi: "Verifikasi dan teruskan aspirasi dari kelasmu ke divisi terkait.",
    slug: "aspirasi",
    peran: Peran.ANGGOTA,
    status: ModuleStatus.AKTIF,
    urutan: 1,
  },
  {
    judul: "Event & Registrasi",
    deskripsi: "Daftar event OSIS dan lakukan check-in QR.",
    slug: "event",
    peran: Peran.ANGGOTA,
    status: ModuleStatus.AKTIF,
    urutan: 2,
  },
  {
    judul: "Absen & Poin Keaktifan",
    deskripsi: "Lihat riwayat kehadiran dan poin keaktifanmu.",
    slug: "absen",
    peran: Peran.ANGGOTA,
    status: ModuleStatus.AKTIF,
    urutan: 3,
  },

  // PERWAKILAN KELAS
  {
    judul: "Aspirasi & Masukan",
    deskripsi: "Ajukan aspirasi dan pantau status tindak lanjutnya.",
    slug: "aspirasi",
    peran: Peran.PERWAKILAN_KELAS,
    status: ModuleStatus.AKTIF,
    urutan: 1,
  },
  {
    judul: "Agenda & Proker",
    deskripsi: "Pantau linimasa program kerja yang sedang berjalan.",
    slug: "agenda",
    peran: Peran.PERWAKILAN_KELAS,
    status: ModuleStatus.AKTIF,
    urutan: 2,
  },
  {
    judul: "Transparansi Dana",
    deskripsi: "Lihat ringkasan kas masuk dan keluar tiap divisi.",
    slug: "keuangan",
    peran: Peran.PERWAKILAN_KELAS,
    status: ModuleStatus.AKTIF,
    urutan: 3,
  },

  // PENGURUS
  {
    judul: "Manajemen Keuangan",
    deskripsi: "Kelola pemasukan, pengeluaran, dan anggaran tiap divisi.",
    slug: "keuangan",
    peran: Peran.PENGURUS,
    status: ModuleStatus.AKTIF,
    urutan: 1,
  },
  {
    judul: "Agenda & Proker",
    deskripsi: "Susun dan perbarui program kerja tiap divisi.",
    slug: "agenda",
    peran: Peran.PENGURUS,
    status: ModuleStatus.AKTIF,
    urutan: 2,
  },
  {
    judul: "Event & Registrasi",
    deskripsi: "Buat event baru dan kelola pendaftaran peserta.",
    slug: "event",
    peran: Peran.PENGURUS,
    status: ModuleStatus.AKTIF,
    urutan: 3,
  },
  {
    judul: "E-Archieving",
    deskripsi: "Simpan dan kelola dokumen serta hasil rapat.",
    slug: "arsip",
    peran: Peran.PENGURUS,
    status: ModuleStatus.AKTIF,
    urutan: 4,
  },
  {
    judul: "Moderasi LPJ",
    deskripsi: "Periksa dan sahkan laporan pertanggungjawaban tiap program.",
    slug: "lpj",
    peran: Peran.PENGURUS,
    status: ModuleStatus.AKTIF,
    urutan: 5,
  },
  {
    judul: "Aspirasi Masuk",
    deskripsi: "Tindak lanjuti aspirasi yang diteruskan oleh perwakilan kelas.",
    slug: "aspirasi",
    peran: Peran.PENGURUS,
    status: ModuleStatus.AKTIF,
    urutan: 6,
  },
  {
    judul: "Manajemen Akun",
    deskripsi: "Buat dan kelola akun anggota, pengurus, dan pembina.",
    slug: "pengguna",
    peran: Peran.PENGURUS,
    status: ModuleStatus.AKTIF,
    urutan: 7,
  },
  {
    judul: "Master Divisi",
    deskripsi: "Kelola daftar divisi organisasi dan penggunaannya dalam Proker serta LPJ.",
    slug: "divisi",
    peran: Peran.PENGURUS,
    status: ModuleStatus.AKTIF,
    urutan: 8,
  },
];

async function main() {
  console.log("Memulai pemulihan modul dashboard...");

  for (const m of modules) {
    const existing = await prisma.module.findFirst({
      where: {
        peran: m.peran,
        judul: m.judul,
      },
    });

    if (existing) {
      await prisma.module.update({
        where: { id_module: existing.id_module },
        data: m,
      });
    } else {
      await prisma.module.create({
        data: m,
      });
    }

    console.log(`Berhasil: ${m.peran} - ${m.judul}`);
  }

  const total = await prisma.module.count();

  console.log("--------------------------------");
  console.log(`Pemulihan selesai. Total modul: ${total}`);
}

main()
  .catch((error) => {
    console.error("Gagal memulihkan modul:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
