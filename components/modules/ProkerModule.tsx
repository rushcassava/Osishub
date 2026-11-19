
"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  type BadgeVariant,
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

type Mode = "perwakilan" | "pengurus";

type DivisiItem = {
  id_divisi: number;
  nama_divisi: string;
};

type ProkerItem = {
  id_proker: number;
  judul: string;
  deskripsi: string;
  divisi: string;
  divisi_id?: number | null;
  status: string;
  targetSelesai: string | null;
  pembuat: { nama: string };
};

const statusVariant: Record<string, BadgeVariant> = {
  RENCANA: "gray",
  BERJALAN: "blue",
  SELESAI: "green",
  DITUNDA: "amber",
};

const statusLabel: Record<string, string> = {
  RENCANA: "Rencana",
  BERJALAN: "Berjalan",
  SELESAI: "Selesai",
  DITUNDA: "Ditunda",
};

const ITEMS_PER_PAGE = 6;

export default function ProkerModule({ mode }: { mode: Mode }) {
  const [items, setItems] = useState<ProkerItem[]>([]);
  const [divisiList, setDivisiList] = useState<DivisiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDivisi, setLoadingDivisi] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Pencarian dan filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Detail dan pengelolaan Proker
  const [selectedProkerId, setSelectedProkerId] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingProker, setDeletingProker] = useState(false);
  const [actionError, setActionError] = useState("");

  // Konfirmasi penghapusan
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Form Proker
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [divisiId, setDivisiId] = useState("");
  const [target, setTarget] = useState("");

  async function load() {
    try {
      setLoading(true);

      const res = await fetch("/api/proker");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data Proker.");
      }

      if (data.proker) {
        setItems(data.proker);
      }
    } catch (error) {
      console.error("Error loading Proker:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadDivisi() {
    try {
      setLoadingDivisi(true);

      const res = await fetch("/api/divisi");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data divisi.");
      }

      setDivisiList(data.divisi || []);
    } catch (error) {
      console.error("Error loading divisi:", error);
      setDivisiList([]);
    } finally {
      setLoadingDivisi(false);
    }
  }

  useEffect(() => {
    load();
    loadDivisi();
  }, []);

  function resetForm() {
    setJudul("");
    setDeskripsi("");
    setDivisiId("");
    setTarget("");
    setFormError("");
  }

  function openForm() {
    resetForm();
    loadDivisi();
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    resetForm();
  }

  function openDetail(id: number) {
    setActionError("");
    setSelectedProkerId(id);
  }

  function closeDetail() {
    if (updatingStatus || deletingProker || deleteConfirmOpen) return;

    setSelectedProkerId(null);
    setActionError("");
  }

  async function buatProker(e: React.FormEvent) {
    e.preventDefault();

    if (!judul.trim() || !deskripsi.trim()) {
      setFormError("Judul dan deskripsi wajib diisi.");
      return;
    }

    if (!divisiId) {
      setFormError("Silakan pilih divisi terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/proker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judul,
          deskripsi,
          divisi_id: Number(divisiId),
          targetSelesai: target || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        closeForm();
        setCurrentPage(1);
        setSearchQuery("");
        setStatusFilter("");
        await load();
      } else {
        setFormError(data.error || "Gagal membuat Proker.");
      }
    } catch (error) {
      console.error("Error creating Proker:", error);
      setFormError("Terjadi kesalahan saat membuat Proker.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    setUpdatingStatus(true);
    setActionError("");

    try {
      const res = await fetch(`/api/proker/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || "Gagal memperbarui status Proker."
        );
      }

      await load();
    } catch (error) {
      console.error("Error updating Proker status:", error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Membuka modal konfirmasi penghapusan
  function bukaKonfirmasiHapus() {
    setActionError("");
    setDeleteConfirmOpen(true);
  }

  // Menutup modal konfirmasi penghapusan
  function tutupKonfirmasiHapus() {
    if (deletingProker) return;

    setDeleteConfirmOpen(false);
  }

  // Menghapus Proker setelah konfirmasi
  async function hapusProker(id: number) {
    setDeletingProker(true);
    setActionError("");

    try {
      const res = await fetch(`/api/proker/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || "Gagal menghapus Proker."
        );
      }

      setDeleteConfirmOpen(false);
      setSelectedProkerId(null);
      setActionError("");
      await load();
    } catch (error) {
      console.error("Error deleting Proker:", error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus Proker."
      );
    } finally {
      setDeletingProker(false);
    }
  }

  // Statistik keseluruhan Proker
  const berjalan = items.filter(
    (i) => i.status === "BERJALAN"
  ).length;

  const selesai = items.filter(
    (i) => i.status === "SELESAI"
  ).length;

  // Proker yang sedang dibuka
  const selectedProker =
    items.find((item) => item.id_proker === selectedProkerId) || null;

  // Sistem pencarian
  const filteredItems = items.filter((p) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      p.judul.toLowerCase().includes(query) ||
      p.deskripsi.toLowerCase().includes(query) ||
      p.divisi.toLowerCase().includes(query) ||
      p.status.toLowerCase().includes(query) ||
      (statusLabel[p.status] || "").toLowerCase().includes(query) ||
      p.pembuat.nama.toLowerCase().includes(query);

    return (
      matchesSearch &&
      (!statusFilter || p.status === statusFilter)
    );
  });

  // Pagination berdasarkan hasil pencarian
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

  // Tindakan yang tersedia mengikuti status Proker
  const availableActions =
    selectedProker?.status === "RENCANA"
      ? [
          {
            status: "BERJALAN",
            label: "Mulai Proker",
            variant: "secondary" as const,
          },
        ]
      : selectedProker?.status === "BERJALAN"
        ? [
            {
              status: "SELESAI",
              label: "Tandai Selesai",
              variant: "success" as const,
            },
            {
              status: "DITUNDA",
              label: "Tunda Proker",
              variant: "danger" as const,
            },
          ]
        : selectedProker?.status === "DITUNDA"
          ? [
              {
                status: "BERJALAN",
                label: "Lanjutkan Proker",
                variant: "secondary" as const,
              },
            ]
          : [];

  return (
    <div className="flex flex-col gap-6">

      {/* Statistik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox
          label="Total Proker"
          value={items.length}
          tone="default"
        />

        <StatBox
          label="Berjalan"
          value={berjalan}
          tone="blue"
        />

        <StatBox
          label="Selesai"
          value={selesai}
          tone="green"
        />
      </div>

      {/* Daftar Program Kerja */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-[16px] font-bold text-navy">
              Daftar Program Kerja
            </h3>

            <p className="mt-1 text-[12.5px] text-inkFaint">
              Pilih program kerja untuk melihat detail dan pengelolaannya.
            </p>
          </div>

          {mode === "pengurus" && (
            <Button onClick={openForm} className="gap-1.5">
              <span className="text-[16px] leading-none">+</span>
              Tambah Proker
            </Button>
          )}
        </div>

        {/* Pencarian dan Filter */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
          <TextInput
            label="Cari Program Kerja"
            placeholder="Cari judul, deskripsi, divisi, atau pembuat..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          <SelectInput
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Semua Status</option>
            <option value="RENCANA">Rencana</option>
            <option value="BERJALAN">Berjalan</option>
            <option value="SELESAI">Selesai</option>
            <option value="DITUNDA">Ditunda</option>
          </SelectInput>
        </div>

        {/* Informasi hasil pencarian */}
        {!loading && (searchQuery.trim() || statusFilter) && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12.5px] text-inkFaint">
              Menemukan {filteredItems.length} dari {items.length} Proker
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("");
                setCurrentPage(1);
              }}
              className="text-[12.5px] font-semibold text-navy hover:underline"
            >
              Reset pencarian
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-[13.5px] text-inkFaint">
            Memuat data...
          </p>
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada proker." />
        ) : filteredItems.length === 0 ? (
          <EmptyState message="Proker tidak ditemukan. Coba kata kunci atau filter lain." />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {paginatedItems.map((p) => (
                <Card key={p.id_proker}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge
                          variant={statusVariant[p.status] || "gray"}
                        >
                          {statusLabel[p.status] || p.status}
                        </Badge>

                        <Badge variant="navy">
                          {p.divisi}
                        </Badge>
                      </div>

                      <h4 className="mb-1 text-[15px] font-semibold text-ink">
                        {p.judul}
                      </h4>

                      <p className="text-[13.5px] leading-relaxed text-inkSoft">
                        {p.deskripsi.length > 160
                          ? `${p.deskripsi.slice(0, 160)}...`
                          : p.deskripsi}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-inkFaint">
                        {p.targetSelesai && (
                          <span>
                            Target: {formatTanggal(p.targetSelesai)}
                          </span>
                        )}

                        <span>
                          oleh {p.pembuat.nama}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center sm:pt-1">
                      <Button
                        variant="secondary"
                        className="!py-2 text-[12.5px]"
                        onClick={() => openDetail(p.id_proker)}
                      >
                        Lihat Detail
                      </Button>
                    </div>

                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
                  {filteredItems.length} Proker
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    disabled={safePage === 1}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.max(prev - 1, 1)
                      )
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
          </>
        )}
      </div>

      {/* Modal Detail Proker */}
      <Modal
        open={selectedProkerId !== null}
        onClose={closeDetail}
        title="Detail Program Kerja"
        size="lg"
      >
        {selectedProker ? (
          <div className="flex flex-col gap-5">

            {/* Informasi utama */}
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant={statusVariant[selectedProker.status] || "gray"}
                >
                  {statusLabel[selectedProker.status] || selectedProker.status}
                </Badge>

                <Badge variant="navy">
                  {selectedProker.divisi}
                </Badge>
              </div>

              <h3 className="text-[19px] font-bold text-navy">
                {selectedProker.judul}
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-inkSoft">
                {selectedProker.deskripsi}
              </p>
            </div>

            {/* Informasi tambahan */}
            <div className="grid grid-cols-1 gap-3 rounded-xl bg-[#F7F8FB] p-4 sm:grid-cols-2">

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-inkFaint">
                  Divisi
                </p>

                <p className="mt-1 text-[13.5px] font-medium text-ink">
                  {selectedProker.divisi}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-inkFaint">
                  Dibuat oleh
                </p>

                <p className="mt-1 text-[13.5px] font-medium text-ink">
                  {selectedProker.pembuat.nama}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-inkFaint">
                  Target penyelesaian
                </p>

                <p className="mt-1 text-[13.5px] font-medium text-ink">
                  {selectedProker.targetSelesai
                    ? formatTanggal(selectedProker.targetSelesai)
                    : "Belum ditentukan"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-inkFaint">
                  Status saat ini
                </p>

                <p className="mt-1 text-[13.5px] font-medium text-ink">
                  {statusLabel[selectedProker.status] || selectedProker.status}
                </p>
              </div>

            </div>

            {/* Tindakan Pengelolaan */}
            {mode === "pengurus" && (
              <div className="border-t border-[#E8EAF0] pt-4">
                <h4 className="mb-1 text-[14px] font-bold text-navy">
                  Tindakan Pengelolaan
                </h4>

                <p className="mb-3 text-[12.5px] text-inkFaint">
                  Pilihan tindakan disesuaikan dengan status program kerja saat ini.
                </p>

                {availableActions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableActions.map((action) => (
                      <Button
                        key={action.status}
                        variant={action.variant}
                        disabled={updatingStatus || deletingProker}
                        onClick={() =>
                          updateStatus(
                            selectedProker.id_proker,
                            action.status
                          )
                        }
                      >
                        {updatingStatus
                          ? "Memproses..."
                          : action.label}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-[#F7F8FB] px-3 py-3 text-[12.5px] text-inkSoft">
                    {selectedProker.status === "SELESAI"
                      ? "Program kerja ini sudah selesai. Tidak ada tindakan lanjutan."
                      : "Tidak ada tindakan yang tersedia untuk status ini."}
                  </p>
                )}

                {actionError && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12.5px] font-medium text-red-600">
                    {actionError}
                  </p>
                )}

                {/* Tombol Hapus Proker */}
                {(selectedProker.status === "RENCANA" ||
                  selectedProker.status === "DITUNDA") && (
                  <div className="mt-4 border-t border-[#E8EAF0] pt-4">
                    <p className="mb-2 text-[12px] text-inkFaint">
                      Jika program kerja salah dibuat atau dibatalkan, kamu dapat menghapusnya di sini.
                    </p>

                    <Button
                      type="button"
                      variant="danger"
                      disabled={updatingStatus || deletingProker}
                      onClick={bukaKonfirmasiHapus}
                    >
                      Hapus Proker
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Tombol tutup */}
            <div className="flex justify-end border-t border-[#E8EAF0] pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={closeDetail}
                disabled={updatingStatus || deletingProker}
              >
                Tutup
              </Button>
            </div>

          </div>
        ) : (
          <p className="text-[13px] text-inkFaint">
            Memuat detail program kerja...
          </p>
        )}
      </Modal>

      {/* Modal Konfirmasi Penghapusan */}
      <Modal
  open={deleteConfirmOpen}
  onClose={tutupKonfirmasiHapus}
  title="Konfirmasi Penghapusan"
  size="md"
>
        <div className="flex flex-col gap-4">

          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50">
              <span className="text-[22px] text-red-600">!</span>
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-navy">
                Hapus Program Kerja?
              </h3>

              <p className="mt-1 text-[13px] leading-relaxed text-inkSoft">
                Apakah kamu yakin ingin menghapus program kerja{" "}
                <span className="font-semibold text-ink">
                  {selectedProker?.judul || "ini"}
                </span>
                ?
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-red-50 px-3 py-3">
            <p className="text-[12px] leading-relaxed text-red-700">
              Perhatian: Data program kerja yang telah dihapus tidak dapat dikembalikan.
            </p>
          </div>

          {actionError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12.5px] font-medium text-red-600">
              {actionError}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-[#E8EAF0] pt-4">
            <Button
              type="button"
              variant="secondary"
              disabled={deletingProker}
              onClick={tutupKonfirmasiHapus}
            >
              Batal
            </Button>

            <Button
              type="button"
              variant="danger"
              disabled={deletingProker || !selectedProker}
              onClick={() => {
                if (selectedProker) {
                  hapusProker(selectedProker.id_proker);
                }
              }}
            >
              {deletingProker ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>

        </div>
      </Modal>

      {/* Modal Form Buat Proker */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title="Buat Proker Baru"
        size="lg"
      >
        <form
          onSubmit={buatProker}
          className="flex flex-col gap-4"
        >
          <p className="text-[13px] text-inkSoft">
            Program kerja yang dibuat akan terlihat oleh semua peran.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_200px]">
            <TextInput
              label="Judul Proker"
              placeholder="mis. Peringatan Hari Kemerdekaan"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />

            <SelectInput
              label="Divisi"
              value={divisiId}
              onChange={(e) => setDivisiId(e.target.value)}
              required
              disabled={
                loadingDivisi || divisiList.length === 0
              }
            >
              <option value="">
                {loadingDivisi
                  ? "Memuat divisi..."
                  : divisiList.length === 0
                    ? "Belum ada divisi"
                    : "Pilih Divisi"}
              </option>

              {divisiList.map((d) => (
                <option
                  key={d.id_divisi}
                  value={d.id_divisi}
                >
                  {d.nama_divisi}
                </option>
              ))}
            </SelectInput>
          </div>

          {divisiList.length === 0 && !loadingDivisi && (
            <p className="text-[12px] text-amber-600">
              Belum ada divisi. Silakan tambahkan divisi melalui menu Master Divisi terlebih dahulu.
            </p>
          )}

          <TextInput
            label="Target Selesai (opsional)"
            type="date"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />

          <TextArea
            label="Deskripsi"
            placeholder="Jelaskan program kerja ini..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            required
          />

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-[#E8EAF0] pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeForm}
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={
                submitting ||
                loadingDivisi ||
                divisiList.length === 0
              }
            >
              {submitting ? "Menyimpan..." : "Buat Proker"}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
