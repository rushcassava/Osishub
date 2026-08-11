"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, SelectInput, StatBox, formatRupiah, formatTanggal } from "@/components/dashboard/ui";

// ─── Tipe Data ─────────────────────────────────────────────────────

type Periode = { tahun_ajaran: string; mulai: string; selesai: string };
type Ringkasan = {
  total_proker: number;
  total_lpj_disahkan: number;
  proker_per_status: Record<string, number>;
  proker_per_divisi: Record<string, number>;
};
type Keuangan = {
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_akhir: number;
  total_transaksi: number;
};
type ProkerItem = {
  id_proker: number;
  judul: string;
  deskripsi: string;
  divisi: string;
  status: string;
  targetSelesai: string | null;
  pembuat: { nama: string };
};
type LpjItem = {
  id_lpj: number;
  judul: string;
  isi: string;
  diajukanPada: string;
  direviewPada: string | null;
  pembuat: { nama: string; jabatan: string | null };
  reviewer: { nama: string } | null;
};
type RekapData = {
  periode: Periode;
  ringkasan: Ringkasan;
  keuangan: Keuangan;
  proker: ProkerItem[];
  lpj: LpjItem[];
};

// ─── Komponen Utama ─────────────────────────────────────────────────

export default function LpjRekapPage() {
  const currentYear = new Date().getFullYear();
  // Tentukan tahun ajaran aktif: jika bulan >= Juli, gunakan tahun sekarang; jika tidak, tahun lalu
  const defaultTahun = new Date().getMonth() >= 6 ? currentYear : currentYear - 1;

  const [tahun, setTahun] = useState(defaultTahun.toString());
  const [pendahuluan, setPendahuluan] = useState(
    "Alhamdulillah, puji syukur kami panjatkan kepada Tuhan Yang Maha Esa atas terselesaikannya seluruh rangkaian program kerja OSIS selama satu periode kepengurusan ini. Laporan Pertanggungjawaban ini kami susun sebagai bentuk transparansi dan akuntabilitas kami kepada seluruh warga sekolah."
  );
  const [penutup, setPenutup] = useState(
    "Demikian Laporan Pertanggungjawaban ini kami sampaikan. Kami menyadari masih banyak kekurangan dalam pelaksanaan program kerja periode ini. Semoga pengurus berikutnya dapat melanjutkan dan meningkatkan capaian yang telah kami raih. Kami berterima kasih kepada seluruh pihak yang telah mendukung kegiatan OSIS selama satu periode ini."
  );
  const [data, setData] = useState<RekapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  // Daftar tahun untuk dropdown: 5 tahun ke belakang
  const tahunOptions = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  async function loadRekap() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/lpj/rekap?tahun=${tahun}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Gagal memuat data rekapitulasi.");
      } else {
        setData(json);
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const statusLabel: Record<string, string> = {
    SELESAI: "Selesai",
    BERJALAN: "Sedang Berjalan",
    RENCANA: "Direncanakan",
    DITUNDA: "Ditunda",
  };

  return (
    <div>
      {/* Header Halaman — hanya tampil di layar, tersembunyi saat cetak */}
      <div className="no-print mb-8">
        <h1 className="mb-1 font-display text-[24px] font-bold text-navy">
          Rekap LPJ Satu Periode
        </h1>
        <p className="mb-6 text-[14.5px] text-inkSoft">
          Generate laporan pertanggungjawaban konsolidasi selama satu tahun ajaran.
        </p>

        <Card className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[160px]">
            <SelectInput
              label="Tahun Ajaran"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
            >
              {tahunOptions.map((t) => (
                <option key={t} value={t}>
                  {t}/{parseInt(t) + 1}
                </option>
              ))}
            </SelectInput>
          </div>
          <Button onClick={loadRekap} disabled={loading}>
            {loading ? "Memuat data..." : "Tampilkan Rekapitulasi"}
          </Button>
          {data && (
            <Button variant="success" onClick={handlePrint}>
              🖨️ Cetak / Simpan PDF
            </Button>
          )}
        </Card>

        {error && (
          <p className="mt-4 text-[14px] font-semibold text-red-600">{error}</p>
        )}
      </div>

      {/* Statistik Cepat — hanya tampil di layar */}
      {data && (
        <div className="no-print mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatBox label="Total Proker" value={data.ringkasan.total_proker} tone="default" />
          <StatBox label="LPJ Disahkan" value={data.ringkasan.total_lpj_disahkan} tone="green" />
          <StatBox label="Total Pemasukan" value={formatRupiah(data.keuangan.total_pemasukan)} tone="green" hint="Selama 1 periode" />
          <StatBox label="Saldo Akhir" value={formatRupiah(data.keuangan.saldo_akhir)} tone={data.keuangan.saldo_akhir >= 0 ? "green" : "red"} />
        </div>
      )}

      {/* ─── DOKUMEN LPJ FORMAL (Layar + Print) ───────────────────── */}
      {data && (
        <div ref={printRef} className="print-doc bg-white p-8 font-serif text-[14px] leading-relaxed text-gray-900 shadow-sm rounded-[16px] border border-[#E8EAF0]">

          {/* ── KOP SURAT ── */}
          <div className="mb-6 border-b-4 border-double border-gray-800 pb-4 text-center">
            <div className="text-[11px] uppercase tracking-widest text-gray-500">Dokumen Resmi</div>
            <h1 className="mt-1 text-[20px] font-bold uppercase tracking-wide">
              LAPORAN PERTANGGUNGJAWABAN
            </h1>
            <h2 className="text-[16px] font-semibold">
              ORGANISASI SISWA INTRA SEKOLAH (OSIS)
            </h2>
            <p className="mt-1 text-[13px]">Periode Kepengurusan Tahun Ajaran {data.periode.tahun_ajaran}</p>
          </div>

          {/* ── BAB I: PENDAHULUAN ── */}
          <section className="mb-8">
            <h2 className="mb-3 text-[15px] font-bold uppercase tracking-wide">BAB I — PENDAHULUAN</h2>
            <h3 className="mb-2 text-[13.5px] font-semibold">A. Latar Belakang & Pengantar</h3>
            <div className="no-print mb-3">
              <textarea
                className="w-full rounded-[9px] border border-[#E8EAF0] bg-[#F8F9FC] px-3 py-2.5 font-sans text-[13.5px] leading-relaxed text-ink outline-none transition focus:border-blue focus:bg-white"
                rows={4}
                value={pendahuluan}
                onChange={(e) => setPendahuluan(e.target.value)}
                placeholder="Tulis teks pendahuluan..."
              />
            </div>
            <p className="print-only hidden whitespace-pre-line">{pendahuluan}</p>
            <p className="no-print">{pendahuluan}</p>

            <h3 className="mb-2 mt-4 text-[13.5px] font-semibold">B. Periode Kepengurusan</h3>
            <p>
              Laporan ini mencakup seluruh kegiatan dan program kerja OSIS yang dilaksanakan
              dari tanggal <strong>{formatTanggal(data.periode.mulai)}</strong> sampai
              dengan <strong>{formatTanggal(data.periode.selesai)}</strong>.
            </p>
          </section>

          {/* ── BAB II: REKAPITULASI PROGRAM KERJA ── */}
          <section className="mb-8">
            <h2 className="mb-3 text-[15px] font-bold uppercase tracking-wide">
              BAB II — REKAPITULASI PROGRAM KERJA
            </h2>
            <h3 className="mb-2 text-[13.5px] font-semibold">A. Ringkasan Capaian</h3>
            <table className="mb-4 w-full border-collapse border border-gray-300 text-[13px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.ringkasan.proker_per_status).map(([status, jml]) => (
                  <tr key={status}>
                    <td className="border border-gray-300 px-3 py-2">{statusLabel[status] || status}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-semibold">{jml}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td className="border border-gray-300 px-3 py-2">Total</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{data.ringkasan.total_proker}</td>
                </tr>
              </tbody>
            </table>

            <h3 className="mb-2 text-[13.5px] font-semibold">B. Daftar Seluruh Program Kerja</h3>
            <table className="mb-4 w-full border-collapse border border-gray-300 text-[12.5px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-2 text-left w-8">No</th>
                  <th className="border border-gray-300 px-2 py-2 text-left">Program Kerja</th>
                  <th className="border border-gray-300 px-2 py-2 text-left">Divisi</th>
                  <th className="border border-gray-300 px-2 py-2 text-center">Status</th>
                  <th className="border border-gray-300 px-2 py-2 text-left">Penanggung Jawab</th>
                </tr>
              </thead>
              <tbody>
                {data.proker.map((p, idx) => (
                  <tr key={p.id_proker} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-2 py-2 text-center">{idx + 1}</td>
                    <td className="border border-gray-300 px-2 py-2">
                      <div className="font-semibold">{p.judul}</div>
                      <div className="text-[11.5px] text-gray-500">{p.deskripsi}</div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">{p.divisi}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{statusLabel[p.status] || p.status}</td>
                    <td className="border border-gray-300 px-2 py-2">{p.pembuat.nama}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="mb-2 text-[13.5px] font-semibold">C. LPJ Program Kerja yang Disahkan</h3>
            {data.lpj.length === 0 ? (
              <p className="italic text-gray-500">Belum ada LPJ yang disahkan dalam periode ini.</p>
            ) : (
              data.lpj.map((l, idx) => (
                <div key={l.id_lpj} className="mb-4 border border-gray-200 rounded p-4">
                  <p className="font-bold">{idx + 1}. {l.judul}</p>
                  <p className="text-[12.5px] text-gray-500 mb-1">
                    Oleh: {l.pembuat.nama}{l.pembuat.jabatan ? ` (${l.pembuat.jabatan})` : ""} ·
                    Diajukan: {formatTanggal(l.diajukanPada)}
                    {l.reviewer ? ` · Disahkan oleh: ${l.reviewer.nama}` : ""}
                  </p>
                  <p className="whitespace-pre-line text-[13px]">{l.isi}</p>
                </div>
              ))
            )}
          </section>

          {/* ── BAB III: REKAPITULASI KEUANGAN ── */}
          <section className="mb-8">
            <h2 className="mb-3 text-[15px] font-bold uppercase tracking-wide">
              BAB III — REKAPITULASI KEUANGAN
            </h2>
            <p className="mb-3">
              Berikut adalah rekapitulasi keuangan organisasi selama periode tahun ajaran {data.periode.tahun_ajaran}
              berdasarkan catatan transaksi kas OSIS.
            </p>
            <table className="mb-4 w-full border-collapse border border-gray-300 text-[13px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">Keterangan</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">Total Pemasukan Kas</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-green-700 font-semibold">
                    {formatRupiah(data.keuangan.total_pemasukan)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2">Total Pengeluaran Kas</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-red-700 font-semibold">
                    ({formatRupiah(data.keuangan.total_pengeluaran)})
                  </td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-gray-300 px-3 py-2">Saldo Akhir Kas</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-[15px]">
                    {formatRupiah(data.keuangan.saldo_akhir)}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-[12.5px] italic text-gray-500">
              * Total {data.keuangan.total_transaksi} catatan transaksi selama periode ini.
            </p>
          </section>

          {/* ── BAB IV: PENUTUP ── */}
          <section className="mb-8">
            <h2 className="mb-3 text-[15px] font-bold uppercase tracking-wide">BAB IV — PENUTUP & EVALUASI</h2>
            <div className="no-print mb-3">
              <textarea
                className="w-full rounded-[9px] border border-[#E8EAF0] bg-[#F8F9FC] px-3 py-2.5 font-sans text-[13.5px] leading-relaxed text-ink outline-none transition focus:border-blue focus:bg-white"
                rows={4}
                value={penutup}
                onChange={(e) => setPenutup(e.target.value)}
                placeholder="Tulis teks penutup dan evaluasi..."
              />
            </div>
            <p className="no-print">{penutup}</p>
          </section>

          {/* ── TANDA TANGAN ── */}
          <div className="mt-12 grid grid-cols-2 gap-8 text-center text-[13px]">
            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold">Pembina OSIS</p>
              <div className="my-14 border-b border-gray-400" />
              <p>________________</p>
            </div>
            <div>
              <p>Ketua OSIS</p>
              <p className="font-semibold">Periode {data.periode.tahun_ajaran}</p>
              <div className="my-14 border-b border-gray-400" />
              <p>________________</p>
            </div>
          </div>
        </div>
      )}

      {/* ── CSS KHUSUS PRINT ── */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; font-family: serif; }
          .print-doc {
            box-shadow: none;
            border: none;
            padding: 0;
            border-radius: 0;
            margin: 0;
          }
          @page {
            margin: 2.5cm 2cm;
            size: A4;
          }
          table { page-break-inside: avoid; }
          section { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
