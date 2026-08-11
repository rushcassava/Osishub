import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const transaksi = await prisma.transaksiKeuangan.findMany({
      orderBy: { tanggal: "desc" },
      include: {
        pencatat: { select: { nama: true } },
      },
    });

    const pemasukan = transaksi
      .filter((t) => t.jenis === "PEMASUKAN")
      .reduce((sum, t) => sum + Number(t.jumlah), 0);
    const pengeluaran = transaksi
      .filter((t) => t.jenis === "PENGELUARAN")
      .reduce((sum, t) => sum + Number(t.jumlah), 0);

    // Ringkasan per kategori (untuk tampilan divisi)
    const kategoriMap = new Map<string, { pemasukan: number; pengeluaran: number }>();
    for (const t of transaksi) {
      const k = t.kategori || "Umum";
      const cur = kategoriMap.get(k) || { pemasukan: 0, pengeluaran: 0 };
      if (t.jenis === "PEMASUKAN") cur.pemasukan += Number(t.jumlah);
      else cur.pengeluaran += Number(t.jumlah);
      kategoriMap.set(k, cur);
    }
    const perKategori = Array.from(kategoriMap.entries()).map(([kategori, v]) => ({
      kategori,
      ...v,
    }));

    return NextResponse.json({
      transaksi,
      ringkasan: {
        pemasukan,
        pengeluaran,
        saldo: pemasukan - pengeluaran,
        total_transaksi: transaksi.length,
      },
      perKategori,
    });
  } catch (err) {
    console.error("Error fetching keuangan:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession(["PENGURUS", "PEMBINA"]);
  if (error) return error;

  try {
    const { judul, jumlah, jenis, kategori, keterangan, tanggal } = await req.json();
    if (!judul || jumlah === undefined || jumlah === null || jumlah === "") {
      return jsonError("Judul dan jumlah wajib diisi.");
    }
    if (jenis !== "PEMASUKAN" && jenis !== "PENGELUARAN") {
      return jsonError("Jenis transaksi tidak valid.");
    }
    if (kategori === "Lainnya" && (!keterangan || !keterangan.trim())) {
      return jsonError("Keterangan wajib diisi untuk kategori Lainnya.");
    }

    const created = await prisma.transaksiKeuangan.create({
      data: {
        judul,
        jumlah: parseFloat(jumlah),
        jenis,
        kategori: kategori || "Umum",
        keterangan: keterangan || null,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        dicatat_oleh: session.id,
      },
    });

    return NextResponse.json({ transaksi: created }, { status: 201 });
  } catch (err) {
    console.error("Error creating transaksi:", err);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

