// One-off script: tambahkan modul "Manajemen Akun" untuk peran PENGURUS
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const m = {
    judul: "Manajemen Akun",
    deskripsi: "Buat dan kelola akun anggota, pengurus, dan pembina.",
    slug: "pengguna",
    peran: "PENGURUS" as const,
    status: "AKTIF" as const,
    urutan: 7,
  };

  const existing = await prisma.module.findFirst({
    where: { peran: m.peran, judul: m.judul },
  });

  if (existing) {
    await prisma.module.update({ where: { id_module: existing.id_module }, data: m });
    console.log(`✅ Modul "Manajemen Akun" sudah ada, diperbarui (id=${existing.id_module}).`);
  } else {
    const created = await prisma.module.create({ data: m });
    console.log(`✅ Modul "Manajemen Akun" ditambahkan (id=${created.id_module}).`);
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

