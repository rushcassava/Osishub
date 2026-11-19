
"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

type Divisi = {
  id_divisi: number;
  nama_divisi: string;
  dibuatPada: string;
};

const ITEMS_PER_PAGE = 5;

export default function PengurusDivisiPage() {
  const [divisi, setDivisi] = useState<Divisi[]>([]);
  const [namaDivisi, setNamaDivisi] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDivisi = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/divisi");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengambil data divisi.");
      }

      setDivisi(result.divisi || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDivisi();
  }, [fetchDivisi]);

  const totalPages = Math.max(
    1,
    Math.ceil(divisi.length / ITEMS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedDivisi = divisi.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function openAddModal() {
    setNamaDivisi("");
    setEditingId(null);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(item: Divisi) {
    setEditingId(item.id_divisi);
    setNamaDivisi(item.nama_divisi);
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setNamaDivisi("");
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!namaDivisi.trim()) {
      setError("Nama divisi wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = editingId
        ? `/api/divisi/${editingId}`
        : "/api/divisi";

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_divisi: namaDivisi.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Gagal menyimpan data divisi."
        );
      }

      const isEditing = editingId !== null;

      setModalOpen(false);
      setNamaDivisi("");
      setEditingId(null);

      setSuccess(
        isEditing
          ? "Nama divisi berhasil diperbarui."
          : "Divisi berhasil ditambahkan."
      );

      await fetchDivisi();

      if (!isEditing) {
        setCurrentPage(1);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Divisi) {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus divisi "${item.nama_divisi}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id_divisi);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/divisi/${item.id_divisi}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Gagal menghapus divisi."
        );
      }

      setSuccess("Divisi berhasil dihapus.");

      await fetchDivisi();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus divisi."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">
            Master Divisi
          </h1>

          <p className="text-[14.5px] text-inkSoft">
            Kelola daftar divisi yang digunakan dalam program kerja dan laporan pertanggungjawaban.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-navy px-5 py-3 text-[13px] font-semibold text-white transition hover:opacity-90"
        >
          <span className="text-[18px] leading-none">+</span>
          Tambah Divisi
        </button>
      </div>

      {error && !modalOpen && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-[13px] text-green-700">
          {success}
        </div>
      )}

      <div className="rounded-xl border border-border bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[16px] font-bold text-navy">
              Daftar Divisi
            </h2>
            <p className="mt-1 text-[12px] text-inkSoft">
              Daftar seluruh divisi organisasi.
            </p>
          </div>

          <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-semibold text-inkSoft">
            {divisi.length} Divisi
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[13px] text-inkSoft">
            Memuat data divisi...
          </div>
        ) : divisi.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-14 text-center">
            <div className="mb-3 text-[32px] text-gray-300">
              <span>▤</span>
            </div>

            <p className="text-[14px] font-semibold text-navy">
              Belum ada divisi
            </p>

            <p className="mt-1 text-[12.5px] text-inkSoft">
              Klik tombol Tambah Divisi untuk membuat divisi pertama.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedDivisi.map((item, index) => (
                <div
                  key={item.id_divisi}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[13px] font-bold text-navy">
                      {(safePage - 1) * ITEMS_PER_PAGE + index + 1}
                    </div>

                    <div>
                      <p className="text-[14px] font-semibold text-navy">
                        {item.nama_divisi}
                      </p>

                      <p className="mt-0.5 text-[11.5px] text-inkSoft">
                        ID Divisi: {item.id_divisi}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="rounded-lg border border-border px-4 py-2 text-[12px] font-semibold text-navy transition hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id_divisi}
                      className="rounded-lg border border-red-200 px-4 py-2 text-[12px] font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === item.id_divisi
                        ? "Menghapus..."
                        : "Hapus"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {divisi.length > ITEMS_PER_PAGE && (
              <div className="mt-6 flex flex-col justify-between gap-4 border-t border-border pt-5 sm:flex-row sm:items-center">
                <p className="text-[12px] text-inkSoft">
                  Menampilkan{" "}
                  {(safePage - 1) * ITEMS_PER_PAGE + 1}
                  {" - "}
                  {Math.min(
                    safePage * ITEMS_PER_PAGE,
                    divisi.length
                  )}{" "}
                  dari {divisi.length} divisi
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={safePage === 1}
                    className="rounded-lg border border-border px-3 py-2 text-[12px] font-semibold text-navy transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>

                  <span className="px-2 text-[12px] font-semibold text-navy">
                    {safePage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={safePage === totalPages}
                    className="rounded-lg border border-border px-3 py-2 text-[12px] font-semibold text-navy transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-navy">
                  {editingId !== null
                    ? "Edit Divisi"
                    : "Tambah Divisi"}
                </h2>

                <p className="mt-1 text-[12.5px] text-inkSoft">
                  {editingId !== null
                    ? "Perbarui nama divisi organisasi."
                    : "Masukkan nama divisi baru."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[20px] text-inkSoft transition hover:bg-gray-100 disabled:opacity-40"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label
                htmlFor="nama-divisi"
                className="mb-2 block text-[13px] font-semibold text-ink"
              >
                Nama Divisi
              </label>

              <input
                id="nama-divisi"
                type="text"
                value={namaDivisi}
                onChange={(e) => setNamaDivisi(e.target.value)}
                placeholder="Contoh: Divisi Humas"
                disabled={saving}
                autoFocus
                className="w-full rounded-lg border border-border bg-white px-3.5 py-3 text-[14px] text-ink outline-none transition focus:border-navy disabled:bg-gray-100"
              />

              {error && modalOpen && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12.5px] text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-border px-4 py-3 text-[13px] font-semibold text-inkSoft transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-navy px-4 py-3 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId !== null
                      ? "Simpan Perubahan"
                      : "Tambah Divisi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
