
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  StatBox,
  formatRupiah,
  formatTanggal,
} from "@/components/dashboard/ui";

type LpjRekapResultProps = {
  tahun: string;
};

type Periode = {
  tahun_ajaran: string;
  mulai: string;
  selesai: string;
};

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

const statusLabel: Record<string, string> = {
  SELESAI: "Selesai",
  BERJALAN: "Sedang Berjalan",
  RENCANA: "Direncanakan",
  DITUNDA: "Ditunda",
};

export default function LpjRekapResult({
  tahun,
}: LpjRekapResultProps) {
  const [pendahuluan, setPendahuluan] = useState(
    "Alhamdulillah, puji syukur kami panjatkan kepada Tuhan Yang Maha Esa atas terselesaikannya seluruh rangkaian program kerja OSIS selama satu periode kepengurusan ini. Laporan Pertanggungjawaban ini kami susun sebagai bentuk transparansi dan akuntabilitas kami kepada seluruh warga sekolah."
  );

  const [penutup, setPenutup] = useState(
    "Demikian Laporan Pertanggungjawaban ini kami sampaikan. Kami menyadari masih banyak kekurangan dalam pelaksanaan program kerja periode ini. Semoga pengurus berikutnya dapat melanjutkan dan meningkatkan capaian yang telah kami raih. Kami berterima kasih kepada seluruh pihak yang telah mendukung kegiatan OSIS selama satu periode ini."
  );

  const [data, setData] = useState<RekapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  const loadRekap = useCallback(async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(
        `/api/lpj/rekap?tahun=${encodeURIComponent(tahun)}`
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.error || "Gagal memuat data rekapitulasi."
        );
      }

      setData(json);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal terhubung ke server."
      );
    } finally {
      setLoading(false);
    }
  }, [tahun]);

  useEffect(() => {
    void loadRekap();
  }, [loadRekap]);

  async function handleDownloadPDF() {
    if (!printRef.current || downloading) return;

    setDownloading(true);
    setError("");

    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default;

      const options: any = {
        margin: [20, 15, 20, 15],
        filename: `Rekap-LPJ-${tahun}-${parseInt(tahun) + 1}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          scrollY: 0,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: ["tr", "h2", "h3"],
        },
      };

      await html2pdf()
        .set(options)
        .from(printRef.current)
        .save();
    } catch (err) {
      console.error("Gagal membuat PDF:", err);

      setError(
        "Gagal membuat PDF. Silakan coba lagi atau periksa koneksi browser."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card className="mb-6">
      {/* HEADER REKAP */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-[16px] font-bold text-navy">
            Rekapitulasi LPJ
          </h3>

          <p className="mt-1 text-[12.5px] text-inkSoft">
            Laporan pertanggungjawaban OSIS berdasarkan tahun ajaran{" "}
            <strong>
              {tahun}/{parseInt(tahun) + 1}
            </strong>.
          </p>
        </div>

        {data && (
          <Button
            variant="success"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? "Membuat PDF..." : "⬇️ Unduh PDF"}
          </Button>
        )}
      </div>

      <div className="mt-5 border-t border-[#E8EAF0] pt-5">
        {/* ERROR */}

        {error && (
          <div className="rounded-[9px] border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-[13px] font-semibold text-red-600">
              {error}
            </p>

            <div className="mt-3">
              <Button
                variant="secondary"
                onClick={loadRekap}
                disabled={loading}
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="rounded-[9px] border border-[#E8EAF0] bg-bgAlt/50 px-4 py-8 text-center">
            <p className="text-[13px] font-medium text-inkSoft">
              Sedang mengambil data rekapitulasi...
            </p>
            <p className="mt-1 text-[11.5px] text-inkFaint">
              Mohon tunggu sebentar.
            </p>
          </div>
        )}

        {/* HASIL REKAP */}

        {data && (
          <>
            {/* STATISTIK */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox
                label="Total Proker"
                value={data.ringkasan.total_proker}
                tone="default"
              />

              <StatBox
                label="LPJ Disahkan"
                value={data.ringkasan.total_lpj_disahkan}
                tone="green"
              />

              <StatBox
                label="Total Pemasukan"
                value={formatRupiah(data.keuangan.total_pemasukan)}
                tone="green"
                hint="Selama 1 periode"
              />

              <StatBox
                label="Saldo Akhir"
                value={formatRupiah(data.keuangan.saldo_akhir)}
                tone={data.keuangan.saldo_akhir >= 0 ? "green" : "red"}
              />
            </div>

            {/* DOKUMEN PDF */}

            <div
              ref={printRef}
              className="mt-5 rounded-[12px] border border-[#E8EAF0] bg-white p-5 font-serif text-[14px] leading-relaxed text-gray-900 sm:p-8"
            >
              {/* KOP LAPORAN */}

              <div className="mb-6 border-b-4 border-double border-gray-800 pb-4 text-center">
                <div className="text-[11px] uppercase tracking-widest text-gray-500">
                  Dokumen Resmi
                </div>

                <h1 className="mt-1 text-[20px] font-bold uppercase tracking-wide">
                  LAPORAN PERTANGGUNGJAWABAN
                </h1>

                <h2 className="text-[16px] font-semibold">
                  ORGANISASI SISWA INTRA SEKOLAH (OSIS)
                </h2>

                <p className="mt-1 text-[13px]">
                  Periode Kepengurusan Tahun Ajaran{" "}
                  {data.periode.tahun_ajaran}
                </p>
              </div>

              {/* BAB I */}

              <section className="mb-8">
                <h2 className="mb-3 text-[15px] font-bold uppercase tracking-wide">
                  BAB I — PENDAHULUAN
                </h2>

                <h3 className="mb-2 text-[13.5px] font-semibold">
                  A. Latar Belakang & Pengantar
                </h3>

                <div
                  data-html2canvas-ignore="true"
                  className="mb-3"
                >
                  <textarea
                    className="w-full rounded border border-[#E8EAF0] bg-[#F8F9FC] px-3 py-2 font-sans text-[13px]"
                    rows={4}
                    value={pendahuluan}
                    onChange={(e) =>
                      setPendahuluan(e.target.value)
                    }
                  />

                  <p className="mt-1 text-[11px] text-inkFaint">
                    Teks ini dapat diedit sebelum mengunduh PDF.
                  </p>
                </div>

                <p className="whitespace-pre-line">
                  {pendahuluan}
                </p>

                <h3 className="mb-2 mt-4 text-[13.5px] font-semibold">
                  B. Periode Kepengurusan
                </h3>

                <p>
                  Laporan ini mencakup seluruh kegiatan dan program kerja
                  OSIS yang dilaksanakan dari tanggal{" "}
                  <strong>
                    {formatTanggal(data.periode.mulai)}
                  </strong>{" "}
                  sampai dengan{" "}
                  <strong>
                    {formatTanggal(data.periode.selesai)}
                  </strong>.
                </p>
              </section>

              {/* BAB II */}

              <section className="mb-8">
                <h2 className="mb-3 text-[15px] font-bold uppercase tracking-wide">
                  BAB II — REKAPITULASI PROGRAM KERJA
                </h2>

                <h3 className="mb-2 text-[13.5px] font-semibold">
                  A. Ringkasan Capaian
                </h3>

                <table className="mb-4 w-full border-collapse border border-gray-300 text-[13px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left">
                        Status
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center">
                        Jumlah
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(
                      data.ringkasan.proker_per_status
                    ).map(([status, jumlah]) => (
                      <tr key={status}>
                        <td className="border border-gray-300 px-3 py-2">
                          {statusLabel[status] || status}
                        </td>

                        <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                          {jumlah}
                        </td>
                      </tr>
                    ))}

                    <tr className="bg-gray-50 font-bold">
                      <td className="border border-gray-300 px-3 py-2">
                        Total
                      </td>

                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {data.ringkasan.total_proker}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="mb-2 text-[13.5px] font-semibold">
                  B. Daftar Seluruh Program Kerja
                </h3>

                <table className="mb-4 w-full border-collapse border border-gray-300 text-[12px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-2">
                        No
                      </th>

                      <th className="border border-gray-300 px-2 py-2 text-left">
                        Program Kerja
                      </th>

                      <th className="border border-gray-300 px-2 py-2 text-left">
                        Divisi
                      </th>

                      <th className="border border-gray-300 px-2 py-2">
                        Status
                      </th>

                      <th className="border border-gray-300 px-2 py-2 text-left">
                        Penanggung Jawab
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.proker.map((p, idx) => (
                      <tr
                        key={p.id_proker}
                        className={
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }
                      >
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {idx + 1}
                        </td>

                        <td className="border border-gray-300 px-2 py-2">
                          <div className="font-semibold">
                            {p.judul}
                          </div>

                          <div className="text-[11px] text-gray-500">
                            {p.deskripsi}
                          </div>
                        </td>

                        <td className="border border-gray-300 px-2 py-2">
                          {p.divisi}
                        </td>

                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {statusLabel[p.status] || p.status}
                        </td>

                        <td className="border border-gray-300 px-2 py-2">
                          {p.pembuat.nama}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3 className="mb-2 text-[13.5px] font-semibold">
                  C. LPJ Program Kerja yang Disahkan
                </h3>

                {data.lpj.length === 0 ? (
                  <p className="italic text-gray-500">
                    Belum ada LPJ yang disahkan dalam periode ini.
                  </p>
                ) : (
                  data.lpj.map((l, idx) => (
                    <div
                      key={l.id_lpj}
                      className="mb-4 rounded border border-gray-200 p-4"
                    >
                      <p className="font-bold">
                        {idx + 1}. {l.judul}
                      </p>

                      <p className="mb-1 text-[12px] text-gray-500">
                        Oleh: {l.pembuat.nama}
                        {l.pembuat.jabatan
                          ? ` (${l.pembuat.jabatan})`
                          : ""}
                        {" · "}Diajukan:{" "}
                        {formatTanggal(l.diajukanPada)}
                        {l.reviewer
                          ? ` · Disahkan oleh: ${l.reviewer.nama}`
                          : ""}
                      </p>

                      <p className="whitespace-pre-line text-[13px]">
                        {l.isi}
                      </p>
                    </div>
                  ))
                )}
              </section>

              {/* BAB III */}

              <section className="mb-8">
                <h2 className="mb-3 text-[15px] font-bold uppercase tracking-wide">
                  BAB III — REKAPITULASI KEUANGAN
                </h2>

                <p className="mb-3">
                  Berikut adalah rekapitulasi keuangan organisasi selama
                  periode tahun ajaran {data.periode.tahun_ajaran}
                  berdasarkan catatan transaksi kas OSIS.
                </p>

                <table className="mb-4 w-full border-collapse border border-gray-300 text-[13px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left">
                        Keterangan
                      </th>

                      <th className="border border-gray-300 px-3 py-2 text-right">
                        Jumlah (Rp)
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">
                        Total Pemasukan Kas
                      </td>

                      <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-green-700">
                        {formatRupiah(data.keuangan.total_pemasukan)}
                      </td>
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2">
                        Total Pengeluaran Kas
                      </td>

                      <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-red-700">
                        ({formatRupiah(data.keuangan.total_pengeluaran)})
                      </td>
                    </tr>

                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-gray-300 px-3 py-2">
                        Saldo Akhir Kas
                      </td>

                      <td className="border border-gray-300 px-3 py-2 text-right text-[15px]">
                        {formatRupiah(data.keuangan.saldo_akhir)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-[12px] italic text-gray-500">
                  * Total {data.keuangan.total_transaksi} catatan transaksi
                  selama periode ini.
                </p>
              </section>

              {/* BAB IV */}

              <section className="mb-8">
                <h2 className="mb-3 text-[15px] font-bold uppercase tracking-wide">
                  BAB IV — PENUTUP & EVALUASI
                </h2>

                <div
                  data-html2canvas-ignore="true"
                  className="mb-3"
                >
                  <textarea
                    className="w-full rounded border border-[#E8EAF0] bg-[#F8F9FC] px-3 py-2 font-sans text-[13px]"
                    rows={4}
                    value={penutup}
                    onChange={(e) => setPenutup(e.target.value)}
                  />

                  <p className="mt-1 text-[11px] text-inkFaint">
                    Teks ini dapat diedit sebelum mengunduh PDF.
                  </p>
                </div>

                <p className="whitespace-pre-line">
                  {penutup}
                </p>
              </section>

              {/* TANDA TANGAN */}

              <div className="mt-12 grid grid-cols-2 gap-8 text-center text-[13px]">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Pembina OSIS</p>

                  <div className="my-14 border-b border-gray-400" />

                  <p>________________________</p>
                </div>

                <div>
                  <p>Ketua OSIS</p>

                  <p className="font-semibold">
                    Periode {data.periode.tahun_ajaran}
                  </p>

                  <div className="my-14 border-b border-gray-400" />

                  <p>________________________</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
