// One-off script: tukar posisi modul aspirasi antara ANGGOTA dan PERWAKILAN_KELAS
// ANGGOTA -> "Tinjau Aspirasi Kelas"
// PERWAKILAN_KELAS -> "Aspirasi & Masukan"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Modul lama untuk ANGGOTA (akan diganti jadi "Tinjau Aspirasi Kelas")
  const anggotaOld = await prisma.module.findFirst({
    where: { peran: "ANGGOTA", judul: "Aspirasi & Masukan" },
  });
  // Modul lama untuk PERWAKILAN_KELAS (akan diganti jadi "Aspirasi & Masukan")
  const perwakilanOld = await prisma.module.findFirst({
    where: { peran: "PERWAKILAN_KELAS", judul: "Tinjau Aspirasi Kelas" },
  });

  if (anggotaOld) {
    await prisma.module.update({
      where: { id_module: anggotaOld.id_module },
      data: {
        judul: "Tinjau Aspirasi Kelas",
        deskripsi: "Verifikasi dan teruskan aspirasi dari kelasmu ke divisi terkait.",
        slug: "aspirasi",
        urutan: 1,
      },
    });
    console.log(`✅ Modul ANGGOTA diperbarui -> "Tinjau Aspirasi Kelas" (id=${anggotaOld.id_module})`);
  } else {
    console.log("⚠️ Modul ANGGOTA 'Aspirasi & Masukan' tidak ditemukan.");
  }

  if (perwakilanOld) {
    await prisma.module.update({
      where: { id_module: perwakilanOld.id_module },
      data: {
        judul: "Aspirasi & Masukan",
        deskripsi: "Ajukan aspirasi dan pantau status tindak lanjutnya.",
        slug: "aspirasi",
        urutan: 1,
      },
    });
    console.log(`✅ Modul PERWAKILAN_KELAS diperbarui -> "Aspirasi & Masukan" (id=${perwakilanOld.id_module})`);
  } else {
    console.log("⚠️ Modul PERWAKILAN_KELAS 'Tinjau Aspirasi Kelas' tidak ditemukan.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

