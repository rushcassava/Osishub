import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

// Contoh parameter: /api/lpj/rekap?tahun=2025
// Akan dihitung otomatis: 1 Juli 2025 s.d. 30 Juni 2026
export async function GET(req: NextRequest) {
  const { error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const tahunStr = searchParams.get("tahun");
  if (!tahunStr) return jsonError("Parameter 'tahun' wajib diisi (contoh: ?tahun=2025).");

  const tahun = parseInt(tahunStr, 10);
  if (isNaN(tahun) || tahun < 2000 || tahun > 2100) {
    return jsonError("Tahun tidak valid.");
  }

  // Periode: 1 Juli tahun s.d. 30 Juni tahun+1
  const periodeStart = new Date(`${tahun}-07-01T00:00:00.000Z`);
  const periodeEnd   = new Date(`${tahun + 1}-06-30T23:59:59.999Z`);

  try {
    // Query paralel untuk efisiensi
    const [lpjDisahkan, semuaProker, semuaTransaksi] = await Promise.all([
      // LPJ yang sudah disahkan dalam periode
      prisma.lpj.findMany({
        where: {
          status: "DISAHKAN",
          diajukanPada: { gte: periodeStart, lte: periodeEnd },
        },
        orderBy: { diajukanPada: "asc" },
        include: {
          pembuat: { select: { nama: true, jabatan: true } },
          reviewer: { select: { nama: true } },
        },
      }),
      // Semua proker dalam periode
      prisma.proker.findMany({
        where: {
          dibuatPada: { gte: periodeStart, lte: periodeEnd },
        },
        orderBy: { dibuatPada: "asc" },
        include: {
          pembuat: { select: { nama: true } },
        },
      }),
      // Semua transaksi keuangan dalam periode
      prisma.transaksiKeuangan.findMany({
        where: {
          tanggal: { gte: periodeStart, lte: periodeEnd },
        },
      }),
    ]);

    // Hitung rekapitulasi keuangan
    const totalPemasukan = semuaTransaksi
      .filter((t) => t.jenis === "PEMASUKAN")
      .reduce((sum, t) => sum + Number(t.jumlah), 0);
    const totalPengeluaran = semuaTransaksi
      .filter((t) => t.jenis === "PENGELUARAN")
      .reduce((sum, t) => sum + Number(t.jumlah), 0);

    // Ringkasan per divisi (dari proker)
    const prokerPerDivisi = semuaProker.reduce<Record<string, number>>((acc, p) => {
      acc[p.divisi] = (acc[p.divisi] || 0) + 1;
      return acc;
    }, {});

    const prokerPerStatus = {
      SELESAI: semuaProker.filter((p) => p.status === "SELESAI").length,
      BERJALAN: semuaProker.filter((p) => p.status === "BERJALAN").length,
      RENCANA: semuaProker.filter((p) => p.status === "RENCANA").length,
      DITUNDA: semuaProker.filter((p) => p.status === "DITUNDA").length,
    };

    return NextResponse.json({
      periode: {
        tahun_ajaran: `${tahun}/${tahun + 1}`,
        mulai: periodeStart.toISOString(),
        selesai: periodeEnd.toISOString(),
      },
      ringkasan: {
        total_proker: semuaProker.length,
        total_lpj_disahkan: lpjDisahkan.length,
        proker_per_status: prokerPerStatus,
        proker_per_divisi: prokerPerDivisi,
      },
      keuangan: {
        total_pemasukan: totalPemasukan,
        total_pengeluaran: totalPengeluaran,
        saldo_akhir: totalPemasukan - totalPengeluaran,
        total_transaksi: semuaTransaksi.length,
      },
      proker: semuaProker,
      lpj: lpjDisahkan,
    });
  } catch (err) {
    console.error("Error fetching LPJ rekap:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}
