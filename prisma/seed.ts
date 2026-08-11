import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ──────────────────────────────────────────────
  // 1. Akun demo
  // ──────────────────────────────────────────────
  const akun = [
    {
      username: "anggota01",
      nama: "Dinda Aulia",
      peran: "ANGGOTA" as const,
      kelas: "XI IPA 2",
    },
    {
      username: "perwakilan01",
      nama: "Raka Pratama",
      peran: "PERWAKILAN_KELAS" as const,
      kelas: "XI IPA 2",
    },
    {
      username: "pengurus01",
      nama: "Sarah Wijaya",
      peran: "PENGURUS" as const,
      jabatan: "Ketua Divisi Acara",
    },
  ];

  const hashedPassword = await bcrypt.hash("password123", 10);

  for (const a of akun) {
    await prisma.pengguna.upsert({
      where: { username: a.username },
      update: {
        password: hashedPassword,
      },
      create: { ...a, password: hashedPassword },
    });
  }

  const anggota = await prisma.pengguna.findUniqueOrThrow({ where: { username: "anggota01" } });
  const perwakilan = await prisma.pengguna.findUniqueOrThrow({ where: { username: "perwakilan01" } });
  const pengurus = await prisma.pengguna.findUniqueOrThrow({ where: { username: "pengurus01" } });

  // ──────────────────────────────────────────────
  // 2. Modul Dashboard per Peran (AKTIF)
  // ──────────────────────────────────────────────
  const modules = [
    // ANGGOTA — meninjau aspirasi kelas
    { judul: "Tinjau Aspirasi Kelas", deskripsi: "Verifikasi dan teruskan aspirasi dari kelasmu ke divisi terkait.", slug: "aspirasi", peran: "ANGGOTA" as const, status: "AKTIF" as const, urutan: 1 },
    { judul: "Event & Registrasi", deskripsi: "Daftar event OSIS dan lakukan check-in QR.", slug: "event", peran: "ANGGOTA" as const, status: "AKTIF" as const, urutan: 2 },
    { judul: "Absen & Poin Keaktifan", deskripsi: "Lihat riwayat kehadiran dan poin keaktifanmu.", slug: "absen", peran: "ANGGOTA" as const, status: "AKTIF" as const, urutan: 3 },
    // PERWAKILAN_KELAS — mengajukan aspirasi & masukan
    { judul: "Aspirasi & Masukan", deskripsi: "Ajukan aspirasi dan pantau status tindak lanjutnya.", slug: "aspirasi", peran: "PERWAKILAN_KELAS" as const, status: "AKTIF" as const, urutan: 1 },
    { judul: "Agenda & Proker", deskripsi: "Pantau linimasa program kerja yang sedang berjalan.", slug: "agenda", peran: "PERWAKILAN_KELAS" as const, status: "AKTIF" as const, urutan: 2 },
    { judul: "Transparansi Dana", deskripsi: "Lihat ringkasan kas masuk dan keluar tiap divisi.", slug: "keuangan", peran: "PERWAKILAN_KELAS" as const, status: "AKTIF" as const, urutan: 3 },
    // PENGURUS
    { judul: "Manajemen Keuangan", deskripsi: "Kelola pemasukan, pengeluaran, dan anggaran tiap divisi.", slug: "keuangan", peran: "PENGURUS" as const, status: "AKTIF" as const, urutan: 1 },
    { judul: "Agenda & Proker", deskripsi: "Susun dan perbarui program kerja tiap divisi.", slug: "agenda", peran: "PENGURUS" as const, status: "AKTIF" as const, urutan: 2 },
    { judul: "Event & Registrasi", deskripsi: "Buat event baru dan kelola pendaftaran peserta.", slug: "event", peran: "PENGURUS" as const, status: "AKTIF" as const, urutan: 3 },
    { judul: "E-Archieving", deskripsi: "Simpan dan kelola dokumen serta hasil rapat.", slug: "arsip", peran: "PENGURUS" as const, status: "AKTIF" as const, urutan: 4 },
    { judul: "Moderasi LPJ", deskripsi: "Periksa dan sahkan laporan pertanggungjawaban tiap program.", slug: "lpj", peran: "PENGURUS" as const, status: "AKTIF" as const, urutan: 5 },
    { judul: "Aspirasi Masuk", deskripsi: "Tindak lanjuti aspirasi yang diteruskan oleh perwakilan kelas.", slug: "aspirasi", peran: "PENGURUS" as const, status: "AKTIF" as const, urutan: 6 },
    { judul: "Manajemen Akun", deskripsi: "Buat dan kelola akun anggota, pengurus, dan pembina.", slug: "pengguna", peran: "PENGURUS" as const, status: "AKTIF" as const, urutan: 7 },
  ];

  for (const m of modules) {
    const existing = await prisma.module.findFirst({
      where: { peran: m.peran, judul: m.judul },
    });
    if (existing) {
      await prisma.module.update({ where: { id_module: existing.id_module }, data: m });
    } else {
      await prisma.module.create({ data: m });
    }
  }

  // ──────────────────────────────────────────────
  // 3. Fitur Landing Page
  // ──────────────────────────────────────────────
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
    const existing = await prisma.feature.findFirst({ where: { judul: f.judul } });
    if (existing) {
      await prisma.feature.update({ where: { id_feature: existing.id_feature }, data: f });
    } else {
      await prisma.feature.create({ data: f });
    }
  }

  // ──────────────────────────────────────────────
  // 4. Statistik Landing Page
  // ──────────────────────────────────────────────
  const stats = [
    { angka: "12", suffix: "", label: "Divisi", deskripsi: "Aktif terkoordinasi dalam satu struktur", urutan: 1 },
    { angka: "48", suffix: "", label: "Proker", deskripsi: "Berjalan dengan linimasa yang terpantau", urutan: 2 },
    { angka: "1.200", suffix: "+", label: "", deskripsi: "Anggota tercatat lintas kelas", urutan: 3 },
    { angka: "Rp 0", suffix: "", label: "", deskripsi: "Dana yang tidak bisa dijelaskan asalnya", urutan: 4 },
  ];

  for (const s of stats) {
    const existing = await prisma.statistic.findFirst({ where: { angka: s.angka } });
    if (existing) {
      await prisma.statistic.update({ where: { id_statistic: existing.id_statistic }, data: s });
    } else {
      await prisma.statistic.create({ data: s });
    }
  }

  // ──────────────────────────────────────────────
  // 5. Peran Landing Page
  // ──────────────────────────────────────────────
  const roles = [
    { tag: "Anggota OSIS", judul: "Bersuara & Terlibat", deskripsi: "Titik awal setiap aspirasi dan partisipasi kegiatan sekolah.", item1: "Mengajukan aspirasi dan masukan", item2: "Mendaftar event dan check-in mandiri", item3: "Memantau poin keaktifan pribadi", urutan: 1 },
    { tag: "Perwakilan Kelas", judul: "Menjembatani Suara", deskripsi: "Penghubung antara kelas dan pengurus, memastikan tak ada aspirasi yang hilang di tengah jalan.", item1: "Meneruskan aspirasi dari kelas", item2: "Memantau agenda dan proker berjalan", item3: "Mengecek transparansi dana organisasi", urutan: 2 },
    { tag: "Pengurus & Pembina", judul: "Mengelola & Mengesahkan", deskripsi: "Pusat kendali operasional — dari keuangan sampai pengesahan laporan setiap divisi.", item1: "Mengelola keuangan dan proker divisi", item2: "Menyelenggarakan event dan arsip", item3: "Memoderasi laporan pertanggungjawaban", urutan: 3 },
  ];

  for (const r of roles) {
    const existing = await prisma.landingRole.findFirst({ where: { tag: r.tag } });
    if (existing) {
      await prisma.landingRole.update({ where: { id_landing_role: existing.id_landing_role }, data: r });
    } else {
      await prisma.landingRole.create({ data: r });
    }
  }

  // ──────────────────────────────────────────────
  // 6. Testimonial Landing Page
  // ──────────────────────────────────────────────
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
    const existing = await prisma.testimonial.findFirst({ where: { nama: t.nama } });
    if (existing) {
      await prisma.testimonial.update({ where: { id_testimonial: existing.id_testimonial }, data: t });
    } else {
      await prisma.testimonial.create({ data: t });
    }
  }

  // ──────────────────────────────────────────────
  // 7. Data Demo — Aspirasi
  // ──────────────────────────────────────────────
  const aspirasiDemo = [
    {
      judul: "Penambahan jam buka perpustakaan",
      isi: "Perpustakaan sering tutup saat jam istirahat. Mohon dipertimbangkan untuk menambah jam buka agar siswa lebih mudah meminjam buku.",
      kategori: "Sarana",
      status: "MENUNGGU" as const,
      penulis_id: anggota.id_pengguna,
      kelas: anggota.kelas,
    },
    {
      judul: "Kipas angin kelas XI IPA 2 rusak",
      isi: "Tiga kipas angin di kelas XI IPA 2 sudah tidak berfungsi sejak dua minggu lalu dan belum diperbaiki.",
      kategori: "Sarana",
      status: "DITINJAU" as const,
      penulis_id: perwakilan.id_pengguna,
      kelas: perwakilan.kelas,
    },
    {
      judul: "Usulan lomba kebersihan kelas",
      isi: "Bagaimana kalau diadakan lomba kebersihan kelas bulanan? Bisa meningkatkan kesadaran menjaga kebersihan.",
      kategori: "Program",
      status: "SELESAI" as const,
      penulis_id: anggota.id_pengguna,
      kelas: anggota.kelas,
      balasan: "Terima kasih atas usulannya. Ide ini sudah dibahas di rapat dan akan dijadwalkan mulai bulan depan.",
    },
  ];

  for (const a of aspirasiDemo) {
    await prisma.aspirasi.create({ data: a });
  }

  // ──────────────────────────────────────────────
  // 8. Data Demo — Event & Registrasi
  // ──────────────────────────────────────────────
  const events = [
    { judul: "Latihan Dasar Kepemimpinan", deskripsi: "Pelatihan dasar kepemimpinan untuk pengurus baru.", tanggal: new Date(Date.now() + 7 * 86400000), lokasi: "Aula Utama", kuota: 80 },
    { judul: "Bakti Sosial Panti Asuhan", deskripsi: "Kegiatan bakti sosial ke panti asuhan sekitar sekolah.", tanggal: new Date(Date.now() - 5 * 86400000), lokasi: "Panti Asuhan Harapan", kuota: 40 },
    { judul: "Pensi Seni Budaya", deskripsi: "Pentas seni tahunan menampilkan bakat siswa.", tanggal: new Date(Date.now() + 21 * 86400000), lokasi: "GOR Sekolah", kuota: 200 },
  ];

  const eventIds: number[] = [];
  for (const e of events) {
    const created = await prisma.event.create({ data: e });
    eventIds.push(created.id_event);
  }

  // Registrasi anggota01 ke event pertama & kedua
  await prisma.registrasiEvent.create({
    data: { event_id: eventIds[0], pengguna_id: anggota.id_pengguna, status: "TERDAFTAR" },
  });
  await prisma.registrasiEvent.create({
    data: { event_id: eventIds[1], pengguna_id: anggota.id_pengguna, status: "HADIR", checkinPada: new Date() },
  });

  // ──────────────────────────────────────────────
  // 9. Data Demo — Proker
  // ──────────────────────────────────────────────
  const prokers = [
    { judul: "Peringatan Hari Kemerdekaan", deskripsi: "Rangkaian lomba dan upacara 17 Agustus.", divisi: "Acara", status: "BERJALAN" as const, targetSelesai: new Date(Date.now() + 30 * 86400000), pembuat_id: pengurus.id_pengguna },
    { judul: "Majalah Dinding Digital", deskripsi: "Media informasi digital sekolah.", divisi: "Media & Informasi", status: "RENCANA" as const, targetSelesai: new Date(Date.now() + 60 * 86400000), pembuat_id: pengurus.id_pengguna },
    { judul: "Class Meeting", deskripsi: "Pertandingan olahraga dan seni antar kelas.", divisi: "Acara", status: "SELESAI" as const, targetSelesai: new Date(Date.now() - 10 * 86400000), pembuat_id: pengurus.id_pengguna },
  ];

  for (const p of prokers) {
    await prisma.proker.create({ data: p });
  }

  // ──────────────────────────────────────────────
  // 10. Data Demo — Keuangan
  // ──────────────────────────────────────────────
  const transaksi = [
    { judul: "Iuran kas bulanan", jumlah: 1500000, jenis: "PEMASUKAN" as const, kategori: "Kas", keterangan: "Iuran anggota bulan Oktober", dicatat_oleh: pengurus.id_pengguna, tanggal: new Date() },
    { judul: "Dana BOS kegiatan", jumlah: 5000000, jenis: "PEMASUKAN" as const, kategori: "Bantuan", keterangan: "Dukungan dana kegiatan OSIS", dicatat_oleh: pengurus.id_pengguna, tanggal: new Date() },
    { judul: "Konsumsi rapat pengurus", jumlah: 350000, jenis: "PENGELUARAN" as const, kategori: "Operasional", keterangan: "Snack rapat koordinasi divisi", dicatat_oleh: pengurus.id_pengguna, tanggal: new Date() },
    { judul: "Sewa sound system", jumlah: 750000, jenis: "PENGELUARAN" as const, kategori: "Event", keterangan: "Sewa sound untuk pensi", dicatat_oleh: pengurus.id_pengguna, tanggal: new Date() },
  ];

  for (const t of transaksi) {
    await prisma.transaksiKeuangan.create({ data: t });
  }

  // ──────────────────────────────────────────────
  // 11. Data Demo — Absensi & Poin
  // ──────────────────────────────────────────────
  await prisma.absensi.create({
    data: { pengguna_id: anggota.id_pengguna, event_id: eventIds[1], hadir: true, waktuHadir: new Date() },
  });

  const poinDemo = [
    { pengguna_id: anggota.id_pengguna, event_id: eventIds[1], jumlah: 5, keterangan: "Hadir Bakti Sosial Panti Asuhan" },
    { pengguna_id: anggota.id_pengguna, event_id: null, jumlah: 3, keterangan: "Kontribusi rapat anggota" },
    { pengguna_id: anggota.id_pengguna, event_id: null, jumlah: 2, keterangan: "Membantu dekorasi mading" },
  ];

  for (const p of poinDemo) {
    await prisma.poinKeaktifan.create({ data: p });
  }

  // ──────────────────────────────────────────────
  // 12. Data Demo — Arsip
  // ──────────────────────────────────────────────
  const arsip = [
    { judul: "Notulen Rapat Pengurus #12", kategori: "Notulen", deskripsi: "Hasil rapat koordinasi pengurus mingguan.", url: "/arsip/notulen-12", pembuat_id: pengurus.id_pengguna },
    { judul: "Dokumentasi LDKS 2024", kategori: "Dokumentasi", deskripsi: "Foto kegiatan LDKS 2024.", url: "/arsip/ldks-2024", pembuat_id: pengurus.id_pengguna },
    { judul: "Surat Izin Kegiatan Pensi", kategori: "Surat", deskripsi: "Surat izin penyelenggaraan pentas seni.", url: "/arsip/surat-pensi", pembuat_id: pengurus.id_pengguna },
  ];

  for (const a of arsip) {
    await prisma.arsip.create({ data: a });
  }

  // ──────────────────────────────────────────────
  // 13. Data Demo — LPJ
  // ──────────────────────────────────────────────
  const lpj = [
    {
      judul: "LPJ Bakti Sosial Panti Asuhan",
      isi: "Laporan pertanggungjawaban kegiatan bakti sosial...",
      status: "DIAJUKAN" as const,
      pembuat_id: pengurus.id_pengguna,
    },
    {
      judul: "LPJ Class Meeting 2024",
      isi: "Laporan pertanggungjawaban class meeting...",
      status: "DISAHKAN" as const,
      pembuat_id: pengurus.id_pengguna,
      reviewer_id: pengurus.id_pengguna,
      direviewPada: new Date(),
    },
  ];

  for (const l of lpj) {
    await prisma.lpj.create({ data: l });
  }

  // ──────────────────────────────────────────────
  // Selesai
  // ──────────────────────────────────────────────
  console.log("✅ Seed selesai. Akun demo (password: password123):");
  akun.forEach((a) => console.log(`   - ${a.username} (${a.peran})`));
  console.log(`   - ${modules.length} modul dashboard (AKTIF)`);
  console.log(`   - ${features.length} fitur landing page`);
  console.log(`   - ${stats.length} statistik`);
  console.log(`   - ${roles.length} peran`);
  console.log(`   - ${testimonials.length} testimonial`);
  console.log(`   - ${aspirasiDemo.length} aspirasi demo`);
  console.log(`   - ${events.length} event demo`);
  console.log(`   - ${prokers.length} proker demo`);
  console.log(`   - ${transaksi.length} transaksi demo`);
  console.log(`   - ${arsip.length} arsip demo`);
  console.log(`   - ${lpj.length} LPJ demo`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

