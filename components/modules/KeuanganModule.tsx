
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
  Table,
  TextArea,
  TextInput,
  formatRupiah,
  formatTanggal,
} from "@/components/dashboard/ui";

type Mode = "perwakilan" | "pengurus";

type TransaksiItem = {
  id_transaksi: number;
  judul: string;
  jumlah: string;
  jenis: "PEMASUKAN" | "PENGELUARAN";
  kategori: string;
  keterangan: string | null;
  tanggal: string;
  pencatat: { nama: string };
};

const ITEMS_PER_PAGE = 6;

export default function KeuanganModule({ mode }: { mode: Mode }) {
  const [transaksi, setTransaksi] = useState<TransaksiItem[]>([]);
  const [perKategori, setPerKategori] = useState<
    { kategori: string; pemasukan: number; pengeluaran: number }[]
  >([]);

  const [ringkasan, setRingkasan] = useState({
    pemasukan: 0,
    pengeluaran: 0,
    saldo: 0,
    total_transaksi: 0,
  });

  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Search dan pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit transaksi
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [judul, setJudul] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [jenis, setJenis] = useState<"PEMASUKAN" | "PENGELUARAN">(
    "PEMASUKAN"
  );
  const [kategori, setKategori] = useState("Kas");
  const [keterangan, setKeterangan] = useState("");

  // Memuat data keuangan
  async function load() {
    setLoading(true);

    try {
      const res = await fetch("/api/keuangan");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data keuangan.");
      }

      if (data.transaksi) setTransaksi(data.transaksi);
      if (data.ringkasan) setRingkasan(data.ringkasan);
      if (data.perKategori) setPerKategori(data.perKategori);
    } catch (error) {
      console.error("Gagal memuat data keuangan:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Filter transaksi berdasarkan pencarian
  const filteredTransaksi = transaksi.filter((t) => {
    const keyword = searchQuery.toLowerCase().trim();

    if (!keyword) return true;

    return (
      t.judul.toLowerCase().includes(keyword) ||
      t.kategori.toLowerCase().includes(keyword) ||
      (t.keterangan || "").toLowerCase().includes(keyword) ||
      (t.pencatat?.nama || "").toLowerCase().includes(keyword) ||
      t.jenis.toLowerCase().includes(keyword) ||
      (t.jenis === "PEMASUKAN"
        ? "pemasukan"
        : "pengeluaran"
      ).includes(keyword)
    );
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredTransaksi.length / ITEMS_PER_PAGE
  );

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const paginatedTransaksi = filteredTransaksi.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Reset form
  function resetForm() {
    setJudul("");
    setJumlah("");
    setJenis("PEMASUKAN");
    setKategori("Kas");
    setKeterangan("");
    setFormError("");
  }

  // Membuka form transaksi baru
  function openForm() {
    resetForm();
    setEditingId(null);
    setFormOpen(true);
  }

  // Membuka form edit dengan data transaksi sebelumnya
  function openEdit(t: TransaksiItem) {
    setEditingId(t.id_transaksi);
    setJudul(t.judul);
    setJumlah(String(t.jumlah));
    setJenis(t.jenis);
    setKategori(t.kategori);
    setKeterangan(t.keterangan || "");
    setFormError("");
    setFormOpen(true);
  }

  // Menutup modal
  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    resetForm();
  }

  // Menyimpan transaksi baru atau perubahan transaksi
  async function catat(e: React.FormEvent) {
    e.preventDefault();

    if (!judul.trim() || !jumlah) {
      setFormError("Judul dan jumlah wajib diisi.");
      return;
    }

    if (
      !Number.isFinite(Number(jumlah)) ||
      Number(jumlah) < 0
    ) {
      setFormError("Jumlah transaksi tidak valid.");
      return;
    }

    if (kategori === "Lainnya" && !keterangan.trim()) {
      setFormError(
        "Keterangan wajib diisi untuk kategori Lainnya."
      );
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const isEditing = editingId !== null;

      const res = await fetch(
        isEditing
          ? `/api/keuangan/${editingId}`
          : "/api/keuangan",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul,
            jumlah,
            jenis,
            kategori,
            keterangan,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        closeForm();
        setCurrentPage(1);
        await load();
      } else {
        setFormError(
          data.error || "Gagal menyimpan transaksi."
        );
      }
    } catch (error) {
      console.error("Error menyimpan transaksi:", error);
      setFormError(
        "Terjadi kesalahan saat menyimpan transaksi."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Menghapus transaksi
  async function hapus(id: number) {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) {
      return;
    }

    try {
      const res = await fetch(`/api/keuangan/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await load();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus transaksi.");
      }
    } catch (error) {
      console.error("Error menghapus transaksi:", error);
      alert("Terjadi kesalahan saat menghapus transaksi.");
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Stat Boxes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox
          label="Saldo Kas"
          value={formatRupiah(ringkasan.saldo)}
          tone={ringkasan.saldo >= 0 ? "green" : "red"}
          hint="Total pemasukan − pengeluaran"
        />

        <StatBox
          label="Pemasukan"
          value={formatRupiah(ringkasan.pemasukan)}
          tone="green"
          hint="Total dana masuk"
        />

        <StatBox
          label="Pengeluaran"
          value={formatRupiah(ringkasan.pengeluaran)}
          tone="red"
          hint="Total dana keluar"
        />
      </div>

      {/* Riwayat Transaksi */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2">

          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-display text-[16px] font-bold text-navy">
              Riwayat Transaksi
            </h3>

            {mode === "pengurus" && (
              <Button
                onClick={openForm}
                className="gap-1.5"
              >
                <span className="text-[16px] leading-none">
                  +
                </span>
                Catat Transaksi
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mb-4">
            <TextInput
              label=""
              placeholder="Cari transaksi, kategori, pencatat..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {loading ? (
            <p className="text-[13.5px] text-inkFaint">
              Memuat data...
            </p>
          ) : filteredTransaksi.length === 0 ? (
            <EmptyState
              message={
                searchQuery
                  ? "Transaksi yang kamu cari tidak ditemukan."
                  : "Belum ada transaksi."
              }
            />
          ) : (
            <>
              <Table
                head={[
                  "Tanggal",
                  "Uraian",
                  "Kategori",
                  "Jumlah",
                  mode === "pengurus" ? "Aksi" : "",
                ]}
              >
                {paginatedTransaksi.map((t) => (
                  <tr key={t.id_transaksi}>

                    <td className="px-4 py-3 whitespace-nowrap text-inkFaint">
                      {formatTanggal(t.tanggal)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">
                        {t.judul}
                      </div>

                      {t.keterangan && (
                        <div className="text-[12px] text-inkFaint">
                          {t.keterangan}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant="navy">
                        {t.kategori}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          t.jenis === "PEMASUKAN"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {t.jenis === "PEMASUKAN" ? "+" : "−"}{" "}
                        {formatRupiah(t.jumlah)}
                      </span>
                    </td>

                    {mode === "pengurus" && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1.5 text-[12px]"
                            onClick={() => openEdit(t)}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="danger"
                            className="!px-3 !py-1.5 text-[12px]"
                            onClick={() => hapus(t.id_transaksi)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </td>
                    )}

                  </tr>
                ))}
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

                  <p className="text-[12px] text-inkFaint">
                    Menampilkan{" "}
                    {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(
                      safePage * ITEMS_PER_PAGE,
                      filteredTransaksi.length
                    )}{" "}
                    dari {filteredTransaksi.length} transaksi
                  </p>

                  <div className="flex items-center gap-2">

                    <Button
                      variant="secondary"
                      disabled={safePage <= 1}
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.max(prev - 1, 1)
                        )
                      }
                    >
                      Sebelumnya
                    </Button>

                    <span className="whitespace-nowrap text-[12px] font-medium text-ink">
                      {safePage} / {totalPages}
                    </span>

                    <Button
                      variant="secondary"
                      disabled={safePage >= totalPages}
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

        {/* Ringkasan per Kategori */}
        <div>
          <h3 className="mb-3 font-display text-[16px] font-bold text-navy">
            Ringkasan per Kategori
          </h3>

          <div className="flex flex-col gap-3">
            {perKategori.map((k) => (
              <Card key={k.kategori}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-ink">
                    {k.kategori}
                  </span>

                  <Badge variant="gray">
                    selisih{" "}
                    {formatRupiah(
                      k.pemasukan - k.pengeluaran
                    )}
                  </Badge>
                </div>

                <div className="flex justify-between text-[13px]">
                  <span className="text-green-600">
                    Masuk: {formatRupiah(k.pemasukan)}
                  </span>

                  <span className="text-red-600">
                    Keluar: {formatRupiah(k.pengeluaran)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Form Catat dan Edit Transaksi */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={
          editingId !== null
            ? "Edit Transaksi"
            : "Catat Transaksi Baru"
        }
        size="lg"
      >
        <form
          onSubmit={catat}
          className="flex flex-col gap-4"
        >

          <p className="text-[13px] text-inkSoft">
            {editingId !== null
              ? "Ubah informasi transaksi keuangan organisasi."
              : "Catat pemasukan atau pengeluaran organisasi. Data langsung masuk ke laporan keuangan."}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <TextInput
              label="Judul / Uraian"
              placeholder="mis. Iuran kas bulanan"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />

            <TextInput
              label="Jumlah (Rp)"
              type="number"
              min="0"
              placeholder="mis. 500000"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              required
            />

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <SelectInput
              label="Jenis"
              value={jenis}
              onChange={(e) =>
                setJenis(
                  e.target.value as
                    | "PEMASUKAN"
                    | "PENGELUARAN"
                )
              }
            >
              <option value="PEMASUKAN">
                Pemasukan
              </option>

              <option value="PENGELUARAN">
                Pengeluaran
              </option>
            </SelectInput>

            <SelectInput
              label="Kategori"
              value={kategori}
              onChange={(e) =>
                setKategori(e.target.value)
              }
            >
              <option>Kas</option>
              <option>Bantuan</option>
              <option>Operasional</option>
              <option>Event</option>
              <option>Sarana</option>
              <option>Lainnya</option>
            </SelectInput>

          </div>

          <TextArea
            label={
              kategori === "Lainnya"
                ? "Keterangan (wajib diisi)"
                : "Keterangan (opsional)"
            }
            value={keterangan}
            onChange={(e) =>
              setKeterangan(e.target.value)
            }
            required={kategori === "Lainnya"}
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
              disabled={submitting}
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Menyimpan..."
                : editingId !== null
                  ? "Simpan Perubahan"
                  : "Catat Transaksi"}
            </Button>

          </div>

        </form>
      </Modal>

    </div>
  );
}
