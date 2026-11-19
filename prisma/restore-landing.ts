
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai pemulihan Landing Page...");

  // 1. FITUR LANDING PAGE
  const features = [
    { judul: "Aspirasi & Masukan", deskripsi: "Suara anggota dan kelas tersalur langsung ke divisi terkait, lengkap dengan status tindak lanjut.", icon_type: "path", icon_path: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", urutan: 1 },
    { judul: "Agenda & Proker", deskripsi: "Rencana kerja tiap divisi tersusun dengan linimasa yang bisa dipantau seluruh anggota.", icon_type: "rect", icon_path: "M16 2v4M8 2v4M3 10h18", urutan: 2 },
    { judul: "Transparansi Dana", deskripsi: "Pemasukan dan pengeluaran organisasi tercatat dan dapat dilihat oleh siapa saja.", icon_type: "path", icon_path: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", urutan: 3 },
    { judul: "Event & Registrasi", deskripsi: "Pendaftaran acara, kuota peserta, dan check-in QR dalam satu alur yang rapi.", icon_type: "rect", icon_path: "M8 2v4M16 2v4M3 10h18M9 16l2 2 4-4", urutan: 4 },
    { judul: "E-Archieving", deskripsi: "Dokumen, surat, dan hasil rapat tersimpan rapi dan mudah dicari kapan saja.", icon_type: "path", icon_path: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6", urutan: 5 },
    { judul: "Absen & Poin Keaktifan", deskripsi: "Kehadiran tercatat otomatis lewat QR, poin keaktifan terakumulasi secara real-time.", icon_type: "squares", icon_path: null, urutan: 6 },
    { judul: "Manajemen Keuangan", deskripsi: "Pemasukan, pengeluaran, dan anggaran tiap divisi terpantau dalam satu dashboard.", icon_type: "rect", icon_path: "M2 10h20M6 15h4", urutan: 7 },
    { judul: "Moderasi LPJ", deskripsi: "Laporan pertanggungjawaban tiap program diperiksa dan disahkan secara berjenjang.", icon_type: "circle", icon_path: "M9 12l2 2 4-4", urutan: 8 },
  ];

  for (const f of features) {
    const existing = await prisma.feature.findFirst({
      where: { judul: f.judul },
    });

    if (existing) {
      await prisma.feature.update({
        where: { id_feature: existing.id_feature },
        data: f,
      });
    } else {
      await prisma.feature.create({ data: f });
    }
  }

  console.log("Berhasil memulihkan 8 fitur.");

  // 2. STATISTIK
  const stats = [
    { angka: "12", suffix: "", label: "Divisi", deskripsi: "Aktif terkoordinasi dalam satu struktur", urutan: 1 },
    { angka: "48", suffix: "", label: "Proker", deskripsi: "Berjalan dengan linimasa yang terpantau", urutan: 2 },
    { angka: "1.200", suffix: "+", label: "", deskripsi: "Anggota tercatat lintas kelas", urutan: 3 },
    { angka: "Rp 0", suffix: "", label: "", deskripsi: "Dana yang tidak bisa dijelaskan asalnya", urutan: 4 },
  ];

  for (const s of stats) {
    const existing = await prisma.statistic.findFirst({
      where: { angka: s.angka },
    });

    if (existing) {
      await prisma.statistic.update({
        where: { id_statistic: existing.id_statistic },
        data: s,
      });
    } else {
      await prisma.statistic.create({ data: s });
    }
  }

  console.log("Berhasil memulihkan 4 statistik.");

  // 3. PILIHAN PERAN
  const roles = [
    { tag: "Anggota OSIS", judul: "Bersuara & Terlibat", deskripsi: "Titik awal setiap aspirasi dan partisipasi kegiatan sekolah.", item1: "Mengajukan aspirasi dan masukan", item2: "Mendaftar event dan check-in mandiri", item3: "Memantau poin keaktifan pribadi", urutan: 1 },
    { tag: "Perwakilan Kelas", judul: "Menjembatani Suara", deskripsi: "Penghubung antara kelas dan pengurus, memastikan tak ada aspirasi yang hilang di tengah jalan.", item1: "Meneruskan aspirasi dari kelas", item2: "Memantau agenda dan proker berjalan", item3: "Mengecek transparansi dana organisasi", urutan: 2 },
    { tag: "Pengurus & Pembina", judul: "Mengelola & Mengesahkan", deskripsi: "Pusat kendali operasional — dari keuangan sampai pengesahan laporan setiap divisi.", item1: "Mengelola keuangan dan proker divisi", item2: "Menyelenggarakan event dan arsip", item3: "Memoderasi laporan pertanggungjawaban", urutan: 3 },
  ];

  for (const r of roles) {
    const existing = await prisma.landingRole.findFirst({
      where: { tag: r.tag },
    });

    if (existing) {
      await prisma.landingRole.update({
        where: { id_landing_role: existing.id_landing_role },
        data: r,
      });
    } else {
      await prisma.landingRole.create({ data: r });
    }
  }

  console.log("Berhasil memulihkan 3 pilihan peran.");

  // 4. TESTIMONIAL
  const testimonials = [
    {
      nama: "Ahmad Fauzi",
      peran: "Ketua OSIS, SMAN 1 Jakarta",
      kutipan: "Dulu koordinasi proker antar divisi selalu manual dan rawan hilang. Sekarang semua tercatat rapi di OSIS-Hub, dari rapat sampai evaluasi akhir.",
      avatar_inisial: "AF",
      urutan: 1,
    },
    {
      nama: "Sari Nurhaliza",
      peran: "Bendahara OSIS, SMAN 5 Bandung",
      kutipan: "Fitur transparansi dana bikin kerjaan saya jauh lebih mudah. Semua pemasukan dan pengeluaran tercatat — tidak ada lagi tuduhan 'dana tidak jelas'.",
      avatar_inisial: "SN",
      urutan: 2,
    },
    {
      nama: "Dimas Ardiansyah",
      peran: "Pembina OSIS, SMAN 3 Surabaya",
      kutipan: "Saya bisa pantau progres setiap divisi tanpa harus kumpul rapat terus. LPJ jadi lebih cepat diperiksa dan disahkan.",
      avatar_inisial: "DA",
      urutan: 3,
    },
    {
      nama: "Pembina OSIS",
      peran: "Sekolah Menengah Atas",
      kutipan: "Sejak pakai OSIS-Hub, rapat pertanggungjawaban jadi lebih singkat — semua data sudah tercatat, tinggal kami sahkan bersama.",
      avatar_inisial: "PO",
      urutan: 4,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { nama: t.nama },
    });

    if (existing) {
      await prisma.testimonial.update({
        where: { id_testimonial: existing.id_testimonial },
        data: t,
      });
    } else {
      await prisma.testimonial.create({ data: t });
    }
  }

  console.log("Berhasil memulihkan 4 testimonial.");

  console.log("--------------------------------");
  console.log("PEMULIHAN LANDING PAGE SELESAI");
  console.log("Total: 19 data berhasil diperiksa.");
}

main()
  .catch((error) => {
    console.error("Pemulihan gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
