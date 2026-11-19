
"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  SelectInput,
  StatBox,
  TextArea,
  TextInput,
  formatTanggal,
} from "@/components/dashboard/ui";

type ArsipItem = {
  id_arsip: number;
  judul: string;
  kategori: string;
  deskripsi: string | null;
  file_nama: string | null;
  url: string | null;
  dibuatPada: string;
  pembuat: { nama: string };
};

export default function ArsipModule() {
  const [items, setItems] = useState<ArsipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Modal form state
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("Notulen");
  const [deskripsi, setDeskripsi] = useState("");
  const [fileNama, setFileNama] = useState("");
  const [url, setUrl] = useState("");

  async function load() {
    setLoading(true);

    try {
      const res = await fetch("/api/arsip");
      const data = await res.json();

      if (data.arsip) {
        setItems(data.arsip);
      }
    } catch {
      setError("Gagal memuat data arsip.");
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Filter arsip berdasarkan kata kunci
  const filteredItems = items.filter((a) => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) return true;

    return (
      a.judul.toLowerCase().includes(keyword) ||
      a.kategori.toLowerCase().includes(keyword) ||
      (a.file_nama ?? "").toLowerCase().includes(keyword) ||
      (a.deskripsi ?? "").toLowerCase().includes(keyword) ||
      a.pembuat.nama.toLowerCase().includes(keyword)
    );
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredItems.length / ITEMS_PER_PAGE
  );

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const paginatedItems = filteredItems.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  function resetForm() {
    setJudul("");
    setKategori("Notulen");
    setDeskripsi("");
    setFileNama("");
    setUrl("");
  }

  function openForm() {
    resetForm();
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    resetForm();
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();

    if (!judul || !fileNama || !url) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/arsip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          kategori,
          deskripsi,
          file_nama: fileNama,
          url,
        }),
      });

      if (res.ok) {
        setMessage("Arsip berhasil disimpan.");
        setTimeout(() => setMessage(""), 3000);

        closeForm();
        setCurrentPage(1);
        await load();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menyimpan arsip.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    }

    setSubmitting(false);
  }

  async function hapus(id: number) {
    if (!confirm("Yakin ingin menghapus arsip ini?")) return;

    setError("");

    try {
      const res = await fetch(`/api/arsip/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage("Arsip berhasil dihapus.");
        setTimeout(() => setMessage(""), 3000);

        await load();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menghapus arsip.");
      }
    } catch {
      setError("Terjadi kesalahan saat menghapus arsip.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Notifikasi Global */}
      {(message || error) && (
        <div
          className={`rounded-lg px-4 py-3 text-[13.5px] font-medium ${
            error
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          {error || message}
        </div>
      )}

      {/* Stat Boxes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox
          label="Total Arsip"
          value={items.length}
          tone="default"
        />

        <StatBox
          label="Notulen"
          value={items.filter((i) => i.kategori === "Notulen").length}
          tone="blue"
        />

        <StatBox
          label="Dokumentasi"
          value={items.filter((i) => i.kategori === "Dokumentasi").length}
          tone="gold"
        />
      </div>

      {/* Header & Tombol Tambah Arsip */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[16px] font-bold text-navy">
            Daftar Arsip
          </h3>

          <Button onClick={openForm} className="gap-1.5">
            <span className="text-[16px] leading-none">+</span>
            Simpan Arsip Baru
          </Button>
        </div>

        {/* Kolom Pencarian */}
        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-inkFaint">
            <svg
              width="17"
              height="17"
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
            }}
            placeholder="Cari judul, kategori, nama file, atau deskripsi arsip..."
            className="w-full rounded-[9px] border border-[#E8EAF0] bg-white py-3 pl-10 pr-4 text-[13px] text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10"
          />
        </div>

        {/* Daftar Arsip */}
        {loading ? (
          <p className="text-[13.5px] text-inkFaint">
            Memuat data...
          </p>
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada arsip." />
        ) : filteredItems.length === 0 ? (
          <EmptyState message="Arsip tidak ditemukan. Coba gunakan kata kunci lain." />
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedItems.map((a) => (
              <Card key={a.id_arsip}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="navy">{a.kategori}</Badge>

                  {a.file_nama && (
                    <Badge variant="gray">{a.file_nama}</Badge>
                  )}

                  <span className="ml-auto text-[12px] text-inkFaint">
                    {formatTanggal(a.dibuatPada)} · oleh {a.pembuat.nama}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-[15px] font-semibold text-ink">
                      {a.judul}
                    </h4>

                    {a.deskripsi && (
                      <p className="mt-0.5 text-[13px] text-inkSoft">
                        {a.deskripsi}
                      </p>
                    )}

                    {a.url && (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 font-mono text-[12.5px] font-medium text-blue hover:text-blueBright hover:underline"
                      >
                        Buka Link Dokumen ↗
                      </a>
                    )}
                  </div>

                  <Button
                    variant="danger"
                    className="shrink-0 !px-3 !py-1.5 text-[12px]"
                    onClick={() => hapus(a.id_arsip)}
                  >
                    Hapus
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-inkFaint">
              Menampilkan{" "}
              {(safePage - 1) * ITEMS_PER_PAGE + 1}
              {" - "}
              {Math.min(
                safePage * ITEMS_PER_PAGE,
                filteredItems.length
              )}
              {" dari "}
              {filteredItems.length} arsip
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={safePage === 1}
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
              >
                Sebelumnya
              </Button>

              <span className="text-[13px] font-medium text-ink">
                {safePage} / {totalPages}
              </span>

              <Button
                variant="secondary"
                disabled={safePage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form Simpan Arsip Baru */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title="Simpan Arsip Baru"
        size="lg"
      >
        <form onSubmit={simpan} className="flex flex-col gap-4">
          <p className="text-[13px] text-inkSoft">
            Dokumen, notulen, surat, dan hasil rapat tersimpan rapi.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_220px]">
            <TextInput
              label="Judul Dokumen"
              placeholder="mis. Notulen Rapat Pengurus #12"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />

            <SelectInput
              label="Kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            >
              <option>Notulen</option>
              <option>Dokumentasi</option>
              <option>Surat</option>
              <option>Laporan</option>
              <option>Lainnya</option>
            </SelectInput>
          </div>

          <TextArea
            label="Deskripsi (opsional)"
            placeholder="Keterangan dokumen..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Nama / Format File"
              placeholder="mis. PDF / Google Drive Document"
              value={fileNama}
              onChange={(e) => setFileNama(e.target.value)}
              required
            />

            <TextInput
              label="URL / Link Dokumen (Google Drive, dll)"
              placeholder="mis. https://drive.google.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E8EAF0] pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeForm}
            >
              Batal
            </Button>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Arsip"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
