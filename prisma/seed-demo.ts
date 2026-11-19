
import {
  PrismaClient,
  Peran,
  StatusAspirasi,
  StatusProker,
  JenisTransaksi,
  StatusLpj,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo123!";
const PREFIX = "[DEMO]";

async function main() {
  console.log("====================================");
  console.log("       OSIS-HUB DEMO SEEDER");
  console.log("====================================");

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ==========================================
  // 1. MEMBUAT AKUN DEMO
  // ==========================================

  const anggota = [];
  const perwakilan = [];
  const pengurus = [];
  const pembina = [];

  async function ensureUser(data: {
    username: string;
    nama: string;
    peran: Peran;
    kelas?: string;
    jabatan?: string;
  }) {
    let user = await prisma.pengguna.findUnique({
      where: { username: data.username },
    });

    if (!user) {
      user = await prisma.pengguna.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });

      console.log("Akun dibuat:", data.username);
    } else {
      console.log("Akun sudah ada, dilewati:", data.username);
    }

    return user;
  }

  for (let i = 1; i <= 20; i++) {
    const user = await ensureUser({
      username: `demo_anggota${String(i).padStart(2, "0")}`,
      nama: `Anggota Demo ${i}`,
      peran: Peran.ANGGOTA,
      kelas: `XI RPL ${((i - 1) % 3) + 1}`,
    });

    anggota.push(user);
  }

  for (let i = 1; i <= 5; i++) {
    const user = await ensureUser({
      username: `demo_perwakilan${String(i).padStart(2, "0")}`,
      nama: `Perwakilan Demo ${i}`,
      peran: Peran.PERWAKILAN_KELAS,
      kelas: `XI RPL ${i}`,
      jabatan: "Perwakilan Kelas",
    });

    perwakilan.push(user);
  }

  for (let i = 1; i <= 4; i++) {
    const user = await ensureUser({
      username: `demo_pengurus${String(i).padStart(2, "0")}`,
      nama: `Pengurus Demo ${i}`,
      peran: Peran.PENGURUS,
      jabatan: [
        "Ketua OSIS",
        "Wakil Ketua OSIS",
        "Sekretaris",
        "Bendahara",
      ][i - 1],
    });

    pengurus.push(user);
  }

  const userPembina = await ensureUser({
    username: "demo_pembina",
    nama: "Pembina Demo",
    peran: Peran.PEMBINA,
    jabatan: "Pembina OSIS",
  });

  pembina.push(userPembina);

  console.log("Total akun demo: 30");

  // ==========================================
  // 2. MASTER DIVISI
  // ==========================================

  const namaDivisi = [
    "Acara",
    "Media & Informasi",
    "Kesejahteraan",
    "Keagamaan",
    "Olahraga",
    "Sekretaris",
    "Bendahara",
  ];

  const divisiList = [];

  for (const nama of namaDivisi) {
    let divisi = await prisma.divisi.findUnique({
      where: { nama_divisi: nama },
    });

    if (!divisi) {
      divisi = await prisma.divisi.create({
        data: { nama_divisi: nama },
      });
    }

    divisiList.push(divisi);
  }

  console.log("Master divisi siap:", divisiList.length);

  // ==========================================
  // 3. EVENT
  // ==========================================

  const events = [];

  for (let i = 1; i <= 40; i++) {
    const judul = `${PREFIX} Event #${String(i).padStart(2, "0")}`;

    let event = await prisma.event.findFirst({
      where: { judul },
    });

    if (!event) {
      const tanggal = new Date();
      tanggal.setDate(tanggal.getDate() + (i - 20));

      event = await prisma.event.create({
        data: {
          judul,
          deskripsi: `Kegiatan demo OSIS-Hub nomor ${i}. Digunakan untuk pengujian modul event dan absensi.`,
          tanggal,
          lokasi: [
            "Aula Sekolah",
            "Lapangan Sekolah",
            "Ruang Multimedia",
            "Laboratorium Komputer",
          ][(i - 1) % 4],
        },
      });
    }

    events.push(event);
  }

  console.log("Event demo siap:", events.length);

  // ==========================================
  // 4. ASPIRASI
  // ==========================================

  const statusAspirasi = [
    StatusAspirasi.MENUNGGU,
    StatusAspirasi.DITINJAU,
    StatusAspirasi.DISETUJUI,
    StatusAspirasi.DITINDAKLANJUTI,
    StatusAspirasi.SELESAI,
    StatusAspirasi.DITOLAK,
  ];

  const kategoriAspirasi = [
    "Fasilitas",
    "Kebersihan",
    "Akademik",
    "Kegiatan",
    "Kedisiplinan",
    "Umum",
  ];

  for (let i = 1; i <= 60; i++) {
    const penulis = perwakilan[(i - 1) % perwakilan.length];
    const judul = `${PREFIX} Aspirasi #${String(i).padStart(2, "0")}`;

    const existing = await prisma.aspirasi.findFirst({
      where: {
        judul,
        penulis_id: penulis.id_pengguna,
      },
    });

    if (!existing) {
      const dibuatPada = new Date();
      dibuatPada.setDate(dibuatPada.getDate() - (i % 30));

      const status = statusAspirasi[(i - 1) % statusAspirasi.length];

      await prisma.aspirasi.create({
        data: {
          judul,
          isi: `Ini adalah isi aspirasi demo nomor ${i}. Data ini digunakan untuk menguji tampilan, filter, dan daftar aspirasi.`,
          kategori: kategoriAspirasi[(i - 1) % kategoriAspirasi.length],
          status,
          penulis_id: penulis.id_pengguna,
          kelas: penulis.kelas,
          balasan:
            status === StatusAspirasi.SELESAI ||
            status === StatusAspirasi.DITOLAK
              ? "Terima kasih atas aspirasi yang telah disampaikan."
              : null,
          dibuatPada,
        },
      });
    }
  }

  console.log("Aspirasi demo siap: 60");

  // ==========================================
  // 5. PROGRAM KERJA
  // ==========================================

  const statusProker = [
    StatusProker.RENCANA,
    StatusProker.BERJALAN,
    StatusProker.SELESAI,
    StatusProker.DITUNDA,
  ];

  for (let i = 1; i <= 60; i++) {
    const divisi = divisiList[(i - 1) % divisiList.length];
    const pembuat = pengurus[(i - 1) % pengurus.length];

    const judul = `${PREFIX} Program Kerja #${String(i).padStart(2, "0")}`;

    const existing = await prisma.proker.findFirst({
      where: {
        judul,
        pembuat_id: pembuat.id_pengguna,
      },
    });

    if (!existing) {
      const targetSelesai = new Date();
      targetSelesai.setDate(targetSelesai.getDate() + i);

      await prisma.proker.create({
        data: {
          judul,
          deskripsi: `Deskripsi program kerja demo nomor ${i}. Program kerja ini merupakan data simulasi.`,
          divisi: divisi.nama_divisi,
          divisi_id: divisi.id_divisi,
          status: statusProker[(i - 1) % statusProker.length],
          targetSelesai,
          pembuat_id: pembuat.id_pengguna,
        },
      });
    }
  }

  console.log("Proker demo siap: 60");

  // ==========================================
  // 6. TRANSAKSI KEUANGAN
  // ==========================================

  const kategoriKeuangan = [
    "Kegiatan",
    "Perlengkapan",
    "Konsumsi",
    "Transportasi",
    "Administrasi",
    "Operasional",
  ];

  for (let i = 1; i <= 60; i++) {
    const pencatat = pengurus[(i - 1) % pengurus.length];
    const judul = `${PREFIX} Transaksi #${String(i).padStart(2, "0")}`;

    const existing = await prisma.transaksiKeuangan.findFirst({
      where: {
        judul,
        dicatat_oleh: pencatat.id_pengguna,
      },
    });

    if (!existing) {
      const tanggal = new Date();
      tanggal.setDate(tanggal.getDate() - (i % 30));

      await prisma.transaksiKeuangan.create({
        data: {
          judul,
          jumlah: 50000 + i * 12500,
          jenis:
            i % 2 === 0
              ? JenisTransaksi.PEMASUKAN
              : JenisTransaksi.PENGELUARAN,
          kategori: kategoriKeuangan[(i - 1) % kategoriKeuangan.length],
          keterangan: `${PREFIX} Keterangan transaksi nomor ${i}`,
          dicatat_oleh: pencatat.id_pengguna,
          tanggal,
        },
      });
    }
  }

  console.log("Transaksi demo siap: 60");

  // ==========================================
  // 7. ABSENSI DAN POIN KEAKTIFAN
  // ==========================================

  let totalAbsensi = 0;
  let totalPoin = 0;

  // 20 anggota x 8 event = 160 data absensi
  for (let i = 0; i < anggota.length; i++) {
    for (let j = 0; j < 8; j++) {
      const user = anggota[i];
      const event = events[j];

      const hadir = (i + j) % 5 !== 0;

      const waktuHadir = new Date(event.tanggal);
      waktuHadir.setHours(8 + (i % 3), 0, 0, 0);

      const absensi = await prisma.absensi.upsert({
        where: {
          pengguna_id_event_id: {
            pengguna_id: user.id_pengguna,
            event_id: event.id_event,
          },
        },
        update: {},
        create: {
          pengguna_id: user.id_pengguna,
          event_id: event.id_event,
          hadir,
          waktuHadir: hadir ? waktuHadir : null,
        },
      });

      totalAbsensi++;

      if (absensi.hadir) {
        const keterangan = `${PREFIX} Hadir dalam kegiatan: ${event.judul}`;

        const existingPoin = await prisma.poinKeaktifan.findFirst({
          where: {
            pengguna_id: user.id_pengguna,
            event_id: event.id_event,
            keterangan,
          },
        });

        if (!existingPoin) {
          await prisma.poinKeaktifan.create({
            data: {
              pengguna_id: user.id_pengguna,
              event_id: event.id_event,
              jumlah: 10,
              keterangan,
            },
          });

          totalPoin++;
        }
      }
    }
  }

  console.log("Absensi demo diproses:", totalAbsensi);
  console.log("Poin demo baru:", totalPoin);

  // ==========================================
  // 8. ARSIP
  // ==========================================

  const kategoriArsip = [
    "Notulen",
    "Dokumentasi",
    "Surat",
    "Proposal",
    "Laporan",
    "Administrasi",
  ];

  for (let i = 1; i <= 60; i++) {
    const pembuat = pengurus[(i - 1) % pengurus.length];
    const judul = `${PREFIX} Arsip #${String(i).padStart(2, "0")}`;

    const existing = await prisma.arsip.findFirst({
      where: {
        judul,
        pembuat_id: pembuat.id_pengguna,
      },
    });

    if (!existing) {
      await prisma.arsip.create({
        data: {
          judul,
          kategori: kategoriArsip[(i - 1) % kategoriArsip.length],
          deskripsi: `Dokumen demo nomor ${i} untuk pengujian modul arsip.`,
          file_nama: `demo-arsip-${String(i).padStart(2, "0")}.pdf`,
          url: `https://example.com/osis-hub-demo/arsip-${i}.pdf`,
          pembuat_id: pembuat.id_pengguna,
        },
      });
    }
  }

  console.log("Arsip demo siap: 60");

  // ==========================================
  // 9. LAPORAN PERTANGGUNGJAWABAN
  // ==========================================

  const statusLpj = [
    StatusLpj.DIAJUKAN,
    StatusLpj.DIREVIEW,
    StatusLpj.DISAHKAN,
    StatusLpj.DITOLAK,
  ];

  for (let i = 1; i <= 60; i++) {
    const pembuat = pengurus[(i - 1) % pengurus.length];
    const divisi = divisiList[(i - 1) % divisiList.length];

    const judul = `${PREFIX} LPJ #${String(i).padStart(2, "0")}`;

    const existing = await prisma.lpj.findFirst({
      where: {
        judul,
        pembuat_id: pembuat.id_pengguna,
      },
    });

    if (!existing) {
      const status = statusLpj[(i - 1) % statusLpj.length];

      const diajukanPada = new Date();
      diajukanPada.setDate(diajukanPada.getDate() - (i % 30));

      await prisma.lpj.create({
        data: {
          judul,
          isi: `Laporan pertanggungjawaban demo nomor ${i}. Berisi ringkasan kegiatan, pelaksanaan, evaluasi, dan penggunaan anggaran.`,
          divisi_id: divisi.id_divisi,
          status,
          pembuat_id: pembuat.id_pengguna,
          reviewer_id:
            status === StatusLpj.DIAJUKAN ? null : userPembina.id_pengguna,
          catatan:
            status === StatusLpj.DISAHKAN
              ? "Laporan telah diperiksa dan disahkan."
              : status === StatusLpj.DITOLAK
                ? "Mohon lengkapi dan perbaiki laporan."
                : null,
          diajukanPada,
          direviewPada:
            status === StatusLpj.DIAJUKAN ? null : new Date(),
        },
      });
    }
  }

  console.log("LPJ demo siap: 60");

  // ==========================================
  // 10. RINGKASAN
  // ==========================================

  console.log("");
  console.log("====================================");
  console.log("       SEEDER BERHASIL!");
  console.log("====================================");
  console.log("Akun demo       : 30");
  console.log("Divisi          : 7");
  console.log("Event           : 40");
  console.log("Aspirasi        : 60");
  console.log("Proker          : 60");
  console.log("Transaksi       : 60");
  console.log("Absensi         : 160");
  console.log("Arsip           : 60");
  console.log("LPJ             : 60");
  console.log("");
  console.log("LOGIN DEMO");
  console.log("Password semua akun baru:", DEMO_PASSWORD);
  console.log("====================================");
}

main()
  .catch((error) => {
    console.error("SEEDER GAGAL:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
