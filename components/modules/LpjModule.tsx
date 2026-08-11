"use client";

import { useEffect, useState } from "react";
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

type LpjItem = {
  id_lpj: number;
  judul: string;
  isi: string;
  status: string;
  catatan: string | null;
  diajukanPada: string;
  pembuat: { nama: string };
  reviewer: { nama: string } | null;
};

// Struktur field LPJ terpisah (dikombinasikan menjadi 1 string saat simpan)
type LpjForm = {
  namaKegiatan: string;
  divisi: string;
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

// Gabungkan form ke dalam satu teks terformat untuk disimpan ke database
function buildIsiFromForm(f: LpjForm): string {
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
Selisih               : Rp ${f.selisihAnggaran}
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

// ─── Konstanta ───────────────────────────────────────────────────────────────

const statusVariant: Record<string, "gray" | "blue" | "green" | "red" | "gold"> = {
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

// ─── Komponen input section label ────────────────────────────────────────────
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
export default function LpjModule() {
  const [items, setItems] = useState<LpjItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [catatanMap, setCatatanMap] = useState<Record<number, string>>({});

  // Judul LPJ (terpisah dari form isi karena juga jadi field database sendiri)
  const [judul, setJudul] = useState("");
  // Form terstruktur
  const [form, setForm] = useState<LpjForm>(FORM_DEFAULT);

  function setField(key: keyof LpjForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function load() {
    setLoading(true);
    const res = await fetch("/api/lpj");
    const data = await res.json();
    if (data.lpj) setItems(data.lpj);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function ajukan(e: React.FormEvent) {
    e.preventDefault();
    if (!judul.trim()) return;
    if (!form.namaKegiatan || !form.deskripsiPelaksanaan) {
      setErrorMsg("Nama kegiatan dan deskripsi pelaksanaan wajib diisi.");
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
        body: JSON.stringify({ judul: judul.trim(), isi }),
      });
      const data = await res.json();
      if (res.ok) {
        setJudul("");
        setForm(FORM_DEFAULT);
        setMessage("LPJ berhasil diajukan.");
        setTimeout(() => setMessage(""), 5000);
        load();
      } else {
        setErrorMsg(data.error || "Gagal mengajukan LPJ. Pastikan Anda memiliki akses.");
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setSubmitting(false);
    }
  }

  async function review(id: number, status: string) {
    const res = await fetch(`/api/lpj/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, catatan: catatanMap[id] || "" }),
    });
    if (res.ok) {
      setMessage(
        status === "DISAHKAN" ? "LPJ berhasil disahkan." :
        status === "DITOLAK"  ? "LPJ ditolak." :
        "Status LPJ diperbarui."
      );
      setTimeout(() => setMessage(""), 3000);
      load();
    }
  }

  const diajukan = items.filter((i) => i.status === "DIAJUKAN").length;
  const disahkan = items.filter((i) => i.status === "DISAHKAN").length;
  const direview = items.filter((i) => i.status === "DIREVIEW").length;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Statistik ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox label="Total LPJ" value={items.length} tone="default" />
        <StatBox label="Perlu Review" value={diajukan} tone="amber" />
        <StatBox label="Disahkan" value={disahkan} tone="green" />
      </div>

      {/* ── Form Ajukan LPJ Terstruktur ── */}
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

          {/* ── A. Informasi Kegiatan ── */}
          <SectionLabel>A. Informasi Kegiatan</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Nama Kegiatan"
              placeholder="mis. Kunjungan Panti Asuhan Permata Indah"
              value={form.namaKegiatan}
              onChange={(e) => setField("namaKegiatan", e.target.value)}
              required
            />
            <TextInput
              label="Divisi / Sie Pelaksana"
              placeholder="mis. Divisi Sosial"
              value={form.divisi}
              onChange={(e) => setField("divisi", e.target.value)}
            />
            <TextInput
              label="Penanggung Jawab"
              placeholder="Nama ketua panitia kegiatan"
              value={form.penanggungJawab}
              onChange={(e) => setField("penanggungJawab", e.target.value)}
            />
            <TextInput
              label="Tanggal Pelaksanaan"
              placeholder="mis. 10 Agustus 2025"
              value={form.tanggalPelaksanaan}
              onChange={(e) => setField("tanggalPelaksanaan", e.target.value)}
            />
            <TextInput
              label="Tempat Pelaksanaan"
              placeholder="mis. Panti Asuhan Permata Indah, Jl. ..."
              value={form.tempatPelaksanaan}
              onChange={(e) => setField("tempatPelaksanaan", e.target.value)}
            />
            <TextInput
              label="Jumlah Peserta"
              placeholder="mis. 45"
              value={form.jumlahPeserta}
              onChange={(e) => setField("jumlahPeserta", e.target.value)}
            />
          </div>

          {/* ── B. Latar Belakang & Tujuan ── */}
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

          {/* ── C. Deskripsi Pelaksanaan ── */}
          <SectionLabel>C. Deskripsi Pelaksanaan</SectionLabel>
          <TextArea
            label="Deskripsi Pelaksanaan Kegiatan"
            placeholder="Ceritakan secara kronologis jalannya kegiatan dari awal hingga akhir, termasuk acara-acara yang berlangsung..."
            value={form.deskripsiPelaksanaan}
            onChange={(e) => setField("deskripsiPelaksanaan", e.target.value)}
            required
          />
          <TextArea
            label="Susunan Kepanitiaan"
            placeholder="Ketua Panitia: ...\nSekretaris: ...\nBendahara: ...\nSie Acara: ...\nSie Perlengkapan: ..."
            value={form.susunanKepanitiaan}
            onChange={(e) => setField("susunanKepanitiaan", e.target.value)}
          />

          {/* ── D. Keuangan ── */}
          <SectionLabel>D. Rekapitulasi Keuangan</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Anggaran yang Direncanakan (Rp)"
              placeholder="mis. 2.500.000"
              value={form.anggaranDirencanakan}
              onChange={(e) => setField("anggaranDirencanakan", e.target.value)}
            />
            <TextInput
              label="Realisasi Anggaran (Rp)"
              placeholder="mis. 2.350.000"
              value={form.anggaranRealisasi}
              onChange={(e) => setField("anggaranRealisasi", e.target.value)}
            />
            <TextInput
              label="Selisih Anggaran (Rp)"
              placeholder="mis. 150.000 (sisa/lebih)"
              value={form.selisihAnggaran}
              onChange={(e) => setField("selisihAnggaran", e.target.value)}
            />
            <TextInput
              label="Sumber Dana"
              placeholder="mis. Kas OSIS, Donatur, Iuran Anggota"
              value={form.sumberDana}
              onChange={(e) => setField("sumberDana", e.target.value)}
            />
          </div>

          {/* ── E. Hambatan & Solusi ── */}
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

          {/* ── F. Evaluasi & Rekomendasi ── */}
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

          {/* ── Submit ── */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[#E8EAF0] pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Mengajukan..." : "Ajukan LPJ"}
            </Button>
            {message && (
              <span className="text-[13px] font-medium text-green-600">✓ {message}</span>
            )}
            {errorMsg && (
              <span className="text-[13px] font-medium text-red-600">✕ {errorMsg}</span>
            )}
          </div>
        </form>
      </FormPanel>

      {/* ── Daftar LPJ ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[16px] font-bold text-navy">Daftar LPJ</h3>
          {direview > 0 && (
            <span className="rounded-full bg-blue px-3 py-1 font-mono text-[11px] text-white">
              {direview} sedang direview
            </span>
          )}
        </div>
        {loading ? (
          <p className="text-[13.5px] text-inkFaint">Memuat data...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada LPJ yang diajukan." />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((l) => (
              <Card key={l.id_lpj}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant[l.status] || "gray"}>
                    {statusLabel[l.status] || l.status}
                  </Badge>
                  {l.reviewer && (
                    <span className="text-[12px] text-inkFaint">
                      direview oleh {l.reviewer.nama}
                    </span>
                  )}
                  <span className="ml-auto text-[12px] text-inkFaint">
                    {formatTanggal(l.diajukanPada)} · oleh {l.pembuat.nama}
                  </span>
                </div>
                <h4 className="mb-2 text-[15px] font-semibold text-ink">{l.judul}</h4>

                {/* Tampilkan isi LPJ terformat dalam box yang rapi */}
                <div className="mb-3 max-h-64 overflow-y-auto rounded-[9px] border border-[#E8EAF0] bg-bgAlt/50 px-4 py-3">
                  <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-inkSoft">
                    {l.isi}
                  </pre>
                </div>

                {l.catatan && (
                  <div className="mb-3 rounded-[9px] border border-blue/10 bg-blueSoft px-4 py-3 text-[13px] text-blue">
                    <span className="font-semibold">Catatan review: </span>
                    {l.catatan}
                  </div>
                )}

                {/* Tombol Review */}
                {l.status !== "DISAHKAN" && l.status !== "DITOLAK" && (
                  <div className="flex flex-wrap items-end gap-2 border-t border-[#E8EAF0] pt-3">
                    <TextInput
                      placeholder="Catatan review (opsional)..."
                      value={catatanMap[l.id_lpj] || ""}
                      onChange={(e) =>
                        setCatatanMap((m) => ({ ...m, [l.id_lpj]: e.target.value }))
                      }
                    />
                    <Button
                      variant="secondary"
                      className="!py-2 text-[12.5px]"
                      onClick={() => review(l.id_lpj, "DIREVIEW")}
                    >
                      Tandai Direview
                    </Button>
                    <Button
                      variant="success"
                      className="!py-2 text-[12.5px]"
                      onClick={() => review(l.id_lpj, "DISAHKAN")}
                    >
                      ✓ Sahkan
                    </Button>
                    <Button
                      variant="danger"
                      className="!py-2 text-[12.5px]"
                      onClick={() => review(l.id_lpj, "DITOLAK")}
                    >
                      Tolak
                    </Button>
                  </div>
                )}

                {(l.status === "DISAHKAN" || l.status === "DITOLAK") && (
                  <div className="mt-2 border-t border-[#E8EAF0] pt-2 text-[12.5px] text-inkFaint">
                    Status final — tidak dapat diubah kembali.
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifikasi Global */}
      {message && (
        <div className="fixed bottom-6 right-6 z-50 rounded-[12px] bg-navy px-5 py-3 text-[13.5px] font-semibold text-white shadow-lg">
          ✓ {message}
        </div>
      )}
    </div>
  );
}
