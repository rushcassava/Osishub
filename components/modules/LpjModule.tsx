
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import LpjRekapPanel from "@/components/modules/LpjRekapPanel";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  FormPanel,
  StatBox,
  TextArea,
  TextInput,
  formatTanggal,
} from "@/components/dashboard/ui";

// ─── Types ───────────────────────────────────────────────────────────────────

type DivisiItem = {
  id_divisi: number;
  nama_divisi: string;
};

type LpjItem = {
  id_lpj: number;
  judul: string;
  isi: string;
  status: string;
  catatan: string | null;
  diajukanPada: string;
  pembuat: { nama: string };
  reviewer: { nama: string } | null;
  divisiMaster?: DivisiItem | null;
  canEdit?: boolean;
};

type LpjPermissions = {
  canCreate: boolean;
  canReview: boolean;
};

type LpjForm = {
  namaKegiatan: string;
  divisi: string;
  divisiId: string;
  penanggungJawab: string;
  tanggalPelaksanaan: string;
  tempatPelaksanaan: string;
  jumlahPeserta: string;
  latarBelakang: string;
  tujuan: string;
  deskripsiPelaksanaan: string;
  susunanKepanitiaan: string;
  anggaranDirencanakan: string;
  anggaranRealisasi: string;
  selisihAnggaran: string;
  sumberDana: string;
  hambatan: string;
  solusi: string;
  evaluasi: string;
  rekomendasi: string;
};

const FORM_DEFAULT: LpjForm = {
  namaKegiatan: "",
  divisi: "",
  divisiId: "",
  penanggungJawab: "",
  tanggalPelaksanaan: "",
  tempatPelaksanaan: "",
  jumlahPeserta: "",
  latarBelakang: "",
  tujuan: "",
  deskripsiPelaksanaan: "",
  susunanKepanitiaan: "",
  anggaranDirencanakan: "",
  anggaranRealisasi: "",
  selisihAnggaran: "",
  sumberDana: "",
  hambatan: "",
  solusi: "",
  evaluasi: "",
  rekomendasi: "",
};

// ─── Fungsi Pembantu Input Angka ─────────────────────────────────────────────

function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

// ─── Perhitungan Selisih Anggaran ────────────────────────────────────────────

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

function getSelisihAnggaran(
  direncanakan: string,
  realisasi: string
) {
  if (direncanakan === "" || realisasi === "") {
    return null;
  }

  const planned = Number(direncanakan);
  const actual = Number(realisasi);
  const difference = planned - actual;

  if (difference > 0) {
    return {
      label: "Sisa",
      nominal: formatRupiah(difference),
    };
  }

  if (difference < 0) {
    return {
      label: "Lebih",
      nominal: formatRupiah(Math.abs(difference)),
    };
  }

  return {
    label: "Sesuai",
    nominal: "0",
  };
}

// ─── Konfigurasi Pagination ──────────────────────────────────────────────────

const ITEMS_PER_PAGE = 5;

// ─── Format Isi LPJ ──────────────────────────────────────────────────────────

function buildIsiFromForm(f: LpjForm): string {
  const selisih = getSelisihAnggaran(
    f.anggaranDirencanakan,
    f.anggaranRealisasi
  );

  const keteranganSelisih = selisih
    ? `${selisih.label} Rp ${selisih.nominal}`
    : "Belum dihitung";

  return `
=== A. INFORMASI KEGIATAN ===
Nama Kegiatan      : ${f.namaKegiatan}
Divisi/Sie         : ${f.divisi}
Penanggung Jawab   : ${f.penanggungJawab}
Tanggal Pelaksanaan: ${f.tanggalPelaksanaan}
Tempat Pelaksanaan : ${f.tempatPelaksanaan}
Jumlah Peserta     : ${f.jumlahPeserta} orang

=== B. LATAR BELAKANG & TUJUAN ===
Latar Belakang:
${f.latarBelakang}

Tujuan Kegiatan:
${f.tujuan}

=== C. DESKRIPSI PELAKSANAAN ===
${f.deskripsiPelaksanaan}

=== D. SUSUNAN KEPANITIAAN ===
${f.susunanKepanitiaan}

=== E. REKAPITULASI KEUANGAN ===
Anggaran Direncanakan : Rp ${f.anggaranDirencanakan}
Realisasi Anggaran    : Rp ${f.anggaranRealisasi}
Selisih Anggaran      : ${keteranganSelisih}
Sumber Dana           : ${f.sumberDana}

=== F. HAMBATAN & SOLUSI ===
Hambatan:
${f.hambatan}

Solusi yang Diterapkan:
${f.solusi}

=== G. EVALUASI & REKOMENDASI ===
Evaluasi:
${f.evaluasi}

Rekomendasi untuk Periode Berikutnya:
${f.rekomendasi}
`.trim();
}

// ─── Status LPJ ──────────────────────────────────────────────────────────────

const statusVariant: Record<
  string,
  "gray" | "blue" | "green" | "red" | "gold"
> = {
  DIAJUKAN: "gray",
  DIREVIEW: "blue",
  DISAHKAN: "green",
  DITOLAK: "red",
};

const statusLabel: Record<string, string> = {
  DIAJUKAN: "Diajukan",
  DIREVIEW: "Direview",
  DISAHKAN: "Disahkan",
  DITOLAK: "Ditolak",
};

// ─── Section Label ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <div className="h-px flex-1 bg-[#E8EAF0]" />
      <span className="rounded-full border border-[#E8EAF0] bg-bgAlt px-3 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-inkFaint">
        {children}
      </span>
      <div className="h-px flex-1 bg-[#E8EAF0]" />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LpjModule({
  mode = "list",
}: {
  mode?: "list" | "form";
}) {
  const router = useRouter();

  const [items, setItems] = useState<LpjItem[]>([]);
  const [divisiList, setDivisiList] = useState<DivisiItem[]>([]);
  const [divisiLoading, setDivisiLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLpjId, setExpandedLpjId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [showRekap, setShowRekap] = useState(false);
  const [loading, setLoading] = useState(true);

  const [permissions, setPermissions] = useState<LpjPermissions>({
    canCreate: false,
    canReview: false,
  });

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [catatanMap, setCatatanMap] = useState<Record<number, string>>({});

  const [judul, setJudul] = useState("");
  const [form, setForm] = useState<LpjForm>(FORM_DEFAULT);

  // Selisih anggaran dihitung otomatis
  const selisihAnggaran = getSelisihAnggaran(
    form.anggaranDirencanakan,
    form.anggaranRealisasi
  );

  function setField(key: keyof LpjForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ─── Mengambil Data LPJ ───────────────────────────────────────────────────

  async function load() {
    setLoading(true);

    try {
      const res = await fetch("/api/lpj");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data LPJ.");
      }

      if (data.lpj) {
        setItems(data.lpj);
      }

      if (data.permissions) {
        setPermissions({
          canCreate: data.permissions.canCreate === true,
          canReview: data.permissions.canReview === true,
        });
      }
    } catch (error) {
      console.error("Error loading LPJ:", error);
      setErrorMsg("Gagal memuat data LPJ. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Mengambil Master Divisi ──────────────────────────────────────────────

  async function loadDivisi() {
    setDivisiLoading(true);

    try {
      const res = await fetch("/api/divisi");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data divisi.");
      }

      setDivisiList(Array.isArray(data.divisi) ? data.divisi : []);
    } catch (error) {
      console.error("Error loading divisi:", error);
      setErrorMsg("Gagal memuat Master Divisi. Silakan coba kembali.");
    } finally {
      setDivisiLoading(false);
    }
  }

  useEffect(() => {
    load();

    if (mode === "form") {
      loadDivisi();
    }
  }, [mode]);

  // ─── Mengajukan LPJ ───────────────────────────────────────────────────────

  async function ajukan(e: React.FormEvent) {
    e.preventDefault();

    if (!permissions.canCreate) {
      setErrorMsg("Kamu tidak memiliki akses untuk mengajukan LPJ.");
      return;
    }

    if (!judul.trim()) {
      setErrorMsg("Judul LPJ wajib diisi.");
      return;
    }

    if (!form.namaKegiatan.trim() || !form.deskripsiPelaksanaan.trim()) {
      setErrorMsg("Nama kegiatan dan deskripsi pelaksanaan wajib diisi.");
      return;
    }

    if (!form.divisiId) {
      setErrorMsg("Silakan pilih Divisi/Sie Pelaksana.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setMessage("");

    try {
      const isi = buildIsiFromForm(form);

      const res = await fetch("/api/lpj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: judul.trim(),
          isi,
          divisi_id: Number(form.divisiId),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setJudul("");
        setForm(FORM_DEFAULT);

        router.push("/dashboard/pengurus/lpj");
        router.refresh();
      } else {
        setErrorMsg(
          data.error ||
            "Gagal mengajukan LPJ. Pastikan kamu memiliki akses."
        );
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server. Periksa koneksi kamu.");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Review LPJ: Hanya Pembina ────────────────────────────────────────────

  async function review(id: number, status: string) {
    if (!permissions.canReview) {
      setErrorMsg("Hanya Pembina OSIS yang dapat melakukan review LPJ.");
      return;
    }

    try {
      const res = await fetch(`/api/lpj/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          catatan: catatanMap[id] || "",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(
          status === "DISAHKAN"
            ? "LPJ berhasil disahkan."
            : status === "DITOLAK"
              ? "LPJ ditolak."
              : "Status LPJ diperbarui."
        );

        setErrorMsg("");
        setTimeout(() => setMessage(""), 3000);

        await load();
      } else {
        setErrorMsg(data.error || "Gagal memperbarui status LPJ.");
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server.");
    }
  }

  // ─── Statistik ────────────────────────────────────────────────────────────

  const diajukan = items.filter((i) => i.status === "DIAJUKAN").length;
  const disahkan = items.filter((i) => i.status === "DISAHKAN").length;
  const direview = items.filter((i) => i.status === "DIREVIEW").length;

  // ─── Pencarian LPJ ────────────────────────────────────────────────────────

  const filteredItems = items.filter((item) =>
    item.judul.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  // ─── Pagination ───────────────────────────────────────────────────────────

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // ─── Tampilan ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Statistik */}

      {mode === "list" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox label="Total LPJ" value={items.length} tone="default" />
          <StatBox label="Perlu Review" value={diajukan} tone="amber" />
          <StatBox label="Disahkan" value={disahkan} tone="green" />
        </div>
      )}

      {/* Form Pengajuan LPJ */}

      {mode === "form" &&
        (loading ? (
          <p className="text-[13.5px] text-inkFaint">
            Memeriksa hak akses...
          </p>
        ) : !permissions.canCreate ? (
          <EmptyState message="Maaf, hanya Pengurus OSIS yang dapat mengajukan LPJ." />
        ) : (
          <FormPanel
            title="Ajukan LPJ"
            subtitle="Isi setiap bagian sesuai format laporan resmi. Data ini akan otomatis masuk ke Rekapitulasi LPJ Tahunan."
          >
            <form onSubmit={ajukan} className="flex flex-col gap-4">
              <TextInput
                label="Judul LPJ"
                placeholder="mis. LPJ Bakti Sosial Panti Asuhan 2025"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />

              <SectionLabel>A. Informasi Kegiatan</SectionLabel>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextInput
                  label="Nama Kegiatan"
                  placeholder="mis. Kunjungan Panti Asuhan Permata Indah"
                  value={form.namaKegiatan}
                  onChange={(e) => setField("namaKegiatan", e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="lpj-divisi"
                    className="text-[12.5px] font-semibold text-ink"
                  >
                    Divisi / Sie Pelaksana
                  </label>

                  <select
                    id="lpj-divisi"
                    value={form.divisiId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedDivisi = divisiList.find(
                        (d) => String(d.id_divisi) === selectedId
                      );

                      setForm((prev) => ({
                        ...prev,
                        divisiId: selectedId,
                        divisi: selectedDivisi?.nama_divisi || "",
                      }));
                    }}
                    required
                    disabled={divisiLoading || divisiList.length === 0}
                    className="w-full rounded-[9px] border border-[#E8EAF0] bg-white px-3 py-3 text-[13px] text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10 disabled:cursor-not-allowed disabled:bg-bgAlt disabled:text-inkFaint"
                  >
                    <option value="">
                      {divisiLoading
                        ? "Memuat daftar divisi..."
                        : divisiList.length === 0
                          ? "Belum ada divisi tersedia"
                          : "Pilih Divisi / Sie"}
                    </option>

                    {divisiList.map((divisi) => (
                      <option
                        key={divisi.id_divisi}
                        value={divisi.id_divisi}
                      >
                        {divisi.nama_divisi}
                      </option>
                    ))}
                  </select>

                  {!divisiLoading && divisiList.length === 0 && (
                    <p className="text-[11px] text-red-500">
                      Tambahkan divisi terlebih dahulu melalui Master Divisi.
                    </p>
                  )}
                </div>

                <TextInput
                  label="Penanggung Jawab"
                  placeholder="Nama ketua panitia kegiatan"
                  value={form.penanggungJawab}
                  onChange={(e) =>
                    setField("penanggungJawab", e.target.value)
                  }
                />

                {/* Tanggal Pelaksanaan: Date Picker */}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="lpj-tanggal"
                    className="text-[12.5px] font-semibold text-ink"
                  >
                    Tanggal Pelaksanaan
                  </label>

                  <input
                    id="lpj-tanggal"
                    type="date"
                    value={form.tanggalPelaksanaan}
                    onChange={(e) =>
                      setField("tanggalPelaksanaan", e.target.value)
                    }
                    className="w-full rounded-[9px] border border-[#E8EAF0] bg-white px-3 py-3 text-[13px] text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10"
                  />
                </div>

                <TextInput
                  label="Tempat Pelaksanaan"
                  placeholder="mis. Panti Asuhan Permata Indah, Jl. ..."
                  value={form.tempatPelaksanaan}
                  onChange={(e) =>
                    setField("tempatPelaksanaan", e.target.value)
                  }
                />

                {/* Jumlah Peserta: Hanya Angka */}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="lpj-jumlah-peserta"
                    className="text-[12.5px] font-semibold text-ink"
                  >
                    Jumlah Peserta
                  </label>

                  <input
                    id="lpj-jumlah-peserta"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="mis. 45"
                    value={form.jumlahPeserta}
                    onChange={(e) =>
                      setField(
                        "jumlahPeserta",
                        onlyDigits(e.target.value)
                      )
                    }
                    className="w-full rounded-[9px] border border-[#E8EAF0] bg-white px-3 py-3 text-[13px] text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10"
                  />
                </div>
              </div>

              <SectionLabel>B. Latar Belakang &amp; Tujuan</SectionLabel>

              <TextArea
                label="Latar Belakang"
                placeholder="Jelaskan mengapa kegiatan ini dilaksanakan, dasar pemikiran, dan relevansinya dengan program OSIS..."
                value={form.latarBelakang}
                onChange={(e) => setField("latarBelakang", e.target.value)}
              />

              <TextArea
                label="Tujuan Kegiatan"
                placeholder="Tuliskan tujuan-tujuan yang ingin dicapai dari kegiatan ini secara terukur..."
                value={form.tujuan}
                onChange={(e) => setField("tujuan", e.target.value)}
              />

              <SectionLabel>C. Deskripsi Pelaksanaan</SectionLabel>

              <TextArea
                label="Deskripsi Pelaksanaan Kegiatan"
                placeholder="Ceritakan secara kronologis jalannya kegiatan dari awal hingga akhir, termasuk acara-acara yang berlangsung..."
                value={form.deskripsiPelaksanaan}
                onChange={(e) =>
                  setField("deskripsiPelaksanaan", e.target.value)
                }
                required
              />

              <TextArea
                label="Susunan Kepanitiaan"
                placeholder={"Ketua Panitia: ...\nSekretaris: ...\nBendahara: ...\nSie Acara: ...\nSie Perlengkapan: ..."}
                value={form.susunanKepanitiaan}
                onChange={(e) =>
                  setField("susunanKepanitiaan", e.target.value)
                }
              />

              <SectionLabel>D. Rekapitulasi Keuangan</SectionLabel>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Anggaran Direncanakan */}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="lpj-anggaran-rencana"
                    className="text-[12.5px] font-semibold text-ink"
                  >
                    Anggaran yang Direncanakan (Rp)
                  </label>

                  <input
                    id="lpj-anggaran-rencana"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="mis. 2500000"
                    value={form.anggaranDirencanakan}
                    onChange={(e) =>
                      setField(
                        "anggaranDirencanakan",
                        onlyDigits(e.target.value)
                      )
                    }
                    className="w-full rounded-[9px] border border-[#E8EAF0] bg-white px-3 py-3 text-[13px] text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10"
                  />
                </div>

                {/* Realisasi Anggaran */}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="lpj-anggaran-realisasi"
                    className="text-[12.5px] font-semibold text-ink"
                  >
                    Realisasi Anggaran (Rp)
                  </label>

                  <input
                    id="lpj-anggaran-realisasi"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="mis. 2350000"
                    value={form.anggaranRealisasi}
                    onChange={(e) =>
                      setField(
                        "anggaranRealisasi",
                        onlyDigits(e.target.value)
                      )
                    }
                    className="w-full rounded-[9px] border border-[#E8EAF0] bg-white px-3 py-3 text-[13px] text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10"
                  />
                </div>

                {/* Selisih Anggaran: Otomatis */}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="lpj-selisih"
                    className="text-[12.5px] font-semibold text-ink"
                  >
                    Selisih Anggaran (Otomatis)
                  </label>

                  <input
                    id="lpj-selisih"
                    type="text"
                    readOnly
                    value={
                      selisihAnggaran
                        ? `${selisihAnggaran.label} Rp ${selisihAnggaran.nominal}`
                        : "Menunggu input anggaran..."
                    }
                    className="w-full cursor-not-allowed rounded-[9px] border border-[#E8EAF0] bg-bgAlt px-3 py-3 text-[13px] font-semibold text-inkSoft outline-none"
                  />

                  <p className="text-[11px] text-inkFaint">
                    Dihitung otomatis dari anggaran yang direncanakan dan realisasi.
                  </p>
                </div>

                <TextInput
                  label="Sumber Dana"
                  placeholder="mis. Kas OSIS, Donatur, Iuran Anggota"
                  value={form.sumberDana}
                  onChange={(e) => setField("sumberDana", e.target.value)}
                />
              </div>

              <SectionLabel>E. Hambatan &amp; Solusi</SectionLabel>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextArea
                  label="Hambatan yang Ditemui"
                  placeholder="Tuliskan kendala-kendala yang terjadi selama persiapan maupun pelaksanaan kegiatan..."
                  value={form.hambatan}
                  onChange={(e) => setField("hambatan", e.target.value)}
                />

                <TextArea
                  label="Solusi yang Diterapkan"
                  placeholder="Bagaimana panitia mengatasi hambatan tersebut secara nyata..."
                  value={form.solusi}
                  onChange={(e) => setField("solusi", e.target.value)}
                />
              </div>

              <SectionLabel>F. Evaluasi &amp; Rekomendasi</SectionLabel>

              <TextArea
                label="Evaluasi Kegiatan"
                placeholder="Bagaimana penilaian keseluruhan kegiatan? Apa yang sudah berjalan baik dan apa yang masih kurang?"
                value={form.evaluasi}
                onChange={(e) => setField("evaluasi", e.target.value)}
              />

              <TextArea
                label="Rekomendasi untuk Periode Berikutnya"
                placeholder="Saran konkret bagi pengurus selanjutnya agar kegiatan serupa dapat berjalan lebih baik..."
                value={form.rekomendasi}
                onChange={(e) => setField("rekomendasi", e.target.value)}
              />

              <div className="flex flex-wrap items-center gap-3 border-t border-[#E8EAF0] pt-4">
                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    divisiLoading ||
                    divisiList.length === 0
                  }
                >
                  {submitting ? "Mengajukan..." : "Ajukan LPJ"}
                </Button>

                {message && (
                  <span className="text-[13px] font-medium text-green-600">
                    ✓ {message}
                  </span>
                )}

                {errorMsg && (
                  <span className="text-[13px] font-medium text-red-600">
                    ✕ {errorMsg}
                  </span>
                )}
              </div>
            </form>
          </FormPanel>
        ))}

      {/* Daftar LPJ */}

      {mode === "list" && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-[16px] font-bold text-navy">
              Daftar LPJ
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {direview > 0 && (
                <span className="rounded-full bg-blue px-3 py-1 font-mono text-[11px] text-white">
                  {direview} sedang direview
                </span>
              )}

              <Button
                variant="secondary"
                onClick={() => setShowRekap((prev) => !prev)}
              >
                {showRekap ? "Tutup Rekap" : "Rekap LPJ"}
              </Button>

              {permissions.canCreate && (
                <Button
                  onClick={() =>
                    router.push("/dashboard/pengurus/lpj/tambah")
                  }
                >
                  + Tambah LPJ
                </Button>
              )}
            </div>
          </div>

          {/* Panel Rekapitulasi LPJ */}

          {showRekap && (
            <LpjRekapPanel onClose={() => setShowRekap(false)} />
          )}

          {/* Kolom Pencarian */}

          <div className="relative mb-4">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-inkFaint">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>

            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
                setExpandedLpjId(null);
              }}
              placeholder="Cari berdasarkan judul LPJ..."
              className="w-full rounded-[9px] border border-[#E8EAF0] bg-white py-3 pl-10 pr-4 text-[13px] text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10"
            />
          </div>

          {loading ? (
            <p className="text-[13.5px] text-inkFaint">Memuat data...</p>
          ) : items.length === 0 ? (
            <EmptyState message="Belum ada LPJ yang diajukan." />
          ) : filteredItems.length === 0 ? (
            <EmptyState message="LPJ tidak ditemukan. Coba gunakan kata kunci lain." />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {paginatedItems.map((l) => {
                  const isExpanded = expandedLpjId === l.id_lpj;

                  return (
                    <Card key={l.id_lpj}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedLpjId(
                            isExpanded ? null : l.id_lpj
                          )
                        }
                        aria-expanded={isExpanded}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[14px] font-semibold text-ink">
                            {l.judul}
                          </h4>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge
                              variant={statusVariant[l.status] || "gray"}
                            >
                              {statusLabel[l.status] || l.status}
                            </Badge>

                            <span className="text-[11px] text-inkFaint">
                              {formatTanggal(l.diajukanPada)}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bgAlt text-inkSoft transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 border-t border-[#E8EAF0] pt-4">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="text-[12px] text-inkFaint">
                              Diajukan oleh {l.pembuat.nama}
                            </span>

                            {l.reviewer && (
                              <span className="text-[12px] text-inkFaint">
                                · Direview oleh {l.reviewer.nama}
                              </span>
                            )}
                          </div>

                          <div className="mb-3 max-h-64 overflow-y-auto rounded-[9px] border border-[#E8EAF0] bg-bgAlt/50 px-4 py-3">
                            <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-inkSoft">
                              {l.isi}
                            </pre>
                          </div>

                          {/* Tombol Detail dan Edit */}

                          <div className="mb-3 flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              className="!py-2 text-[12.5px]"
                              onClick={() =>
                                router.push(
                                  `/dashboard/pengurus/lpj/detail/${l.id_lpj}`
                                )
                              }
                            >
                              Lihat Detail →
                            </Button>

                            {l.canEdit === true && (
                              <Button
                                className="!py-2 text-[12.5px]"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/pengurus/lpj/edit/${l.id_lpj}`
                                  )
                                }
                              >
                                ✎ Edit LPJ
                              </Button>
                            )}
                          </div>

                          {l.catatan && (
                            <div className="mb-3 rounded-[9px] border border-blue/10 bg-blueSoft px-4 py-3 text-[13px] text-blue">
                              <span className="font-semibold">
                                Catatan review:{" "}
                              </span>
                              {l.catatan}
                            </div>
                          )}

                          {permissions.canReview &&
                            l.status !== "DISAHKAN" &&
                            l.status !== "DITOLAK" && (
                              <div className="flex flex-wrap items-end gap-2 border-t border-[#E8EAF0] pt-3">
                                <TextInput
                                  placeholder="Catatan review (opsional)..."
                                  value={catatanMap[l.id_lpj] || ""}
                                  onChange={(e) =>
                                    setCatatanMap((m) => ({
                                      ...m,
                                      [l.id_lpj]: e.target.value,
                                    }))
                                  }
                                />

                                <Button
                                  variant="secondary"
                                  className="!py-2 text-[12.5px]"
                                  onClick={() =>
                                    review(l.id_lpj, "DIREVIEW")
                                  }
                                >
                                  Tandai Direview
                                </Button>

                                <Button
                                  variant="success"
                                  className="!py-2 text-[12.5px]"
                                  onClick={() =>
                                    review(l.id_lpj, "DISAHKAN")
                                  }
                                >
                                  ✓ Sahkan
                                </Button>

                                <Button
                                  variant="danger"
                                  className="!py-2 text-[12.5px]"
                                  onClick={() =>
                                    review(l.id_lpj, "DITOLAK")
                                  }
                                >
                                  Tolak
                                </Button>
                              </div>
                            )}

                          {l.status === "DISAHKAN" && (
                            <div className="mt-2 border-t border-[#E8EAF0] pt-2 text-[12.5px] text-inkFaint">
                              LPJ sudah disahkan dan tidak dapat diedit kembali.
                            </div>
                          )}

                          {l.status === "DITOLAK" && (
                            <div className="mt-2 border-t border-[#E8EAF0] pt-2 text-[12.5px] text-inkFaint">
                              LPJ ditolak. Pembuat LPJ dapat memperbaiki dan mengajukannya kembali.
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Navigasi Pagination */}

              {filteredItems.length > ITEMS_PER_PAGE && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EAF0] pt-4">
                  <span className="text-[12px] text-inkFaint">
                    Menampilkan {startIndex + 1}–
                    {Math.min(
                      startIndex + ITEMS_PER_PAGE,
                      filteredItems.length
                    )}{" "}
                    dari {filteredItems.length} LPJ
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      disabled={safeCurrentPage === 1}
                      onClick={() => {
                        setCurrentPage((page) => Math.max(1, page - 1));
                        setExpandedLpjId(null);
                      }}
                    >
                      ← Sebelumnya
                    </Button>

                    <span className="px-2 text-[13px] font-semibold text-ink">
                      {safeCurrentPage} / {totalPages}
                    </span>

                    <Button
                      variant="secondary"
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        );
                        setExpandedLpjId(null);
                      }}
                    >
                      Berikutnya →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Toast Notifikasi */}

      {mode === "list" && message && (
        <div className="fixed bottom-6 right-6 z-50 rounded-[12px] bg-navy px-5 py-3 text-[13.5px] font-semibold text-white shadow-lg">
          ✓ {message}
        </div>
      )}

      {mode === "list" && errorMsg && (
        <div className="rounded-[9px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          ✕ {errorMsg}
        </div>
      )}
    </div>
  );
}
