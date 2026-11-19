
"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  type BadgeVariant,
  Button,
  Card,
  EmptyState,
  FormPanel,
  SelectInput,
  TextArea,
  TextInput,
  formatTanggal,
} from "@/components/dashboard/ui";

type Mode = "submit" | "review" | "pengurus";

type AspirasiItem = {
  id_aspirasi: number;
  judul: string;
  isi: string;
  kategori: string;
  status: string;
  kelas: string | null;
  balasan: string | null;
  alasan_penolakan?: string | null;
  dibuatPada: string;
  diperbaruiPada?: string;
  penulis: {
    nama: string;
    kelas: string | null;
    peran: string;
  };
};

const statusVariant: Record<string, BadgeVariant> = {
  MENUNGGU: "amber",
  DITINJAU: "blue",
  DISETUJUI: "blue",
  DITINDAKLANJUTI: "gold",
  SELESAI: "green",
  DITOLAK: "red",
};

const statusLabel: Record<string, string> = {
  MENUNGGU: "Menunggu",
  DITINJAU: "Ditinjau",
  DISETUJUI: "Disetujui",
  DITINDAKLANJUTI: "Ditindaklanjuti",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
};

const ITEMS_PER_PAGE = 5;

export default function AspirasiModule({
  mode,
}: {
  mode: Mode;
}) {
  const [items, setItems] = useState<AspirasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Form pengajuan aspirasi
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [kategori, setKategori] = useState("Umum");

  // Pesan notifikasi
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);

  // Modal detail
  const [selected, setSelected] = useState<AspirasiItem | null>(null);

  // Form pengelolaan Pengurus
  const [alasanPenolakan, setAlasanPenolakan] = useState("");
  const [progressDraft, setProgressDraft] = useState("");
  const [processing, setProcessing] = useState(false);

  function showMessage(text: string, isError = false) {
    setMessage(text);
    setMessageError(isError);
  }

  async function load() {
    setLoading(true);

    try {
      const res = await fetch("/api/aspirasi");
      const data = await res.json();

      if (res.ok && data.aspirasi) {
        setItems(data.aspirasi);

        setSelected((previous) => {
          if (!previous) return null;

          return (
            data.aspirasi.find(
              (item: AspirasiItem) =>
                item.id_aspirasi === previous.id_aspirasi
            ) || null
          );
        });
      } else {
        showMessage(
          data.error || "Gagal memuat data aspirasi.",
          true
        );
      }
    } catch {
      showMessage("Gagal memuat data aspirasi.", true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pagination
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const paginatedItems = items.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  function openDetail(item: AspirasiItem) {
    setSelected(item);
    setAlasanPenolakan("");
    setProgressDraft(item.balasan || "");
  }

  function closeDetail() {
    if (processing) return;

    setSelected(null);
    setAlasanPenolakan("");
    setProgressDraft("");
  }

  // Pengajuan aspirasi
  async function submitAspirasi(e: React.FormEvent) {
    e.preventDefault();

    if (!judul.trim() || !isi.trim()) {
      showMessage("Judul dan isi aspirasi wajib diisi.", true);
      return;
    }

    try {
      const res = await fetch("/api/aspirasi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judul: judul.trim(),
          isi: isi.trim(),
          kategori,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setJudul("");
        setIsi("");
        setKategori("Umum");
        setCurrentPage(1);

        showMessage("Aspirasi berhasil diajukan.");
        await load();
      } else {
        showMessage(
          data.error || "Gagal mengajukan aspirasi.",
          true
        );
      }
    } catch {
      showMessage("Terjadi kesalahan saat mengirim aspirasi.", true);
    }
  }

  // Mengubah status aspirasi
  async function updateStatus(
    id: number,
    status: string,
    extra: Record<string, string> = {}
  ) {
    if (processing) return;

    setProcessing(true);

    try {
      const res = await fetch(`/api/aspirasi/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          ...extra,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("Status aspirasi berhasil diperbarui.");
        await load();
        setAlasanPenolakan("");
      } else {
        showMessage(
          data.error || "Gagal memperbarui status.",
          true
        );
      }
    } catch {
      showMessage("Terjadi kesalahan saat memperbarui status.", true);
    } finally {
      setProcessing(false);
    }
  }

  // Menyimpan progres tanpa mengubah status
  async function saveProgress() {
    if (!selected || processing) return;

    if (!progressDraft.trim()) {
      showMessage("Isi progres atau balasan terlebih dahulu.", true);
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch(
        `/api/aspirasi/${selected.id_aspirasi}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            balasan: progressDraft.trim(),
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        showMessage("Progres berhasil diperbarui.");
        await load();
      } else {
        showMessage(
          data.error || "Gagal menyimpan progres.",
          true
        );
      }
    } catch {
      showMessage("Terjadi kesalahan saat menyimpan progres.", true);
    } finally {
      setProcessing(false);
    }
  }

  // Menolak aspirasi dengan alasan
  async function rejectAspirasi() {
    if (!selected) return;

    if (!alasanPenolakan.trim()) {
      showMessage("Alasan penolakan wajib diisi.", true);
      return;
    }

    await updateStatus(
      selected.id_aspirasi,
      "DITOLAK",
      {
        alasan_penolakan: alasanPenolakan.trim(),
      }
    );
  }

  // Judul berdasarkan mode
  const sectionTitle =
    mode === "submit"
      ? "Aspirasiku"
      : mode === "review"
        ? "Aspirasi Kelas yang Masuk"
        : "Aspirasi Masuk";

  return (
    <div className="flex flex-col gap-6">

      {/* Form pengajuan */}
      {mode === "submit" && (
        <FormPanel
          title="Ajukan Aspirasi"
          subtitle="Sampaikan masukan, kritik, atau usulanmu kepada OSIS."
        >
          <form
            onSubmit={submitAspirasi}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_220px]">
              <TextInput
                label="Judul"
                placeholder="mis. Penambahan jam buka perpustakaan"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />

              <SelectInput
                label="Kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
              >
                <option>Umum</option>
                <option>Sarana</option>
                <option>Program</option>
                <option>Akademik</option>
                <option>Lainnya</option>
              </SelectInput>
            </div>

            <TextArea
              label="Isi Aspirasi"
              placeholder="Jelaskan aspirasi atau masukanmu secara jelas..."
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              required
            />

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">
                Kirim Aspirasi
              </Button>
            </div>
          </form>
        </FormPanel>
      )}

      {/* Notifikasi */}
      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-[13px] font-medium ${
            messageError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message}
          <button
            type="button"
            onClick={() => setMessage("")}
            className="ml-3 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Daftar aspirasi */}
      <div>
        <h3 className="mb-3 font-display text-[16px] font-bold text-navy">
          {sectionTitle}
        </h3>

        {loading ? (
          <p className="text-[13.5px] text-inkFaint">
            Memuat data...
          </p>
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada aspirasi." />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {paginatedItems.map((a) => (
                <div
                  key={a.id_aspirasi}
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetail(a)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDetail(a);
                    }
                  }}
                  className="cursor-pointer rounded-xl text-left transition hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <Card>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={statusVariant[a.status] || "gray"}
                      >
                        {statusLabel[a.status] || a.status}
                      </Badge>

                      <Badge variant="navy">
                        {a.kategori}
                      </Badge>

                      {mode !== "submit" && (
                        <span className="text-[12.5px] text-inkFaint">
                          dari {a.penulis?.nama || "Pengguna"}
                          {a.kelas ? ` · ${a.kelas}` : ""}
                        </span>
                      )}

                      <span className="ml-auto text-[12px] text-inkFaint">
                        {formatTanggal(a.dibuatPada)}
                      </span>
                    </div>

                    <h4 className="mt-3 text-[15px] font-semibold text-ink">
                      {a.judul}
                    </h4>

                    <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-inkSoft">
                      {a.isi}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[12px] text-inkFaint">
                        {a.balasan
                          ? "Memiliki pembaruan dari OSIS"
                          : "Belum ada pembaruan"}
                      </span>

                      <span className="text-[12px] font-semibold text-blue-600">
                        Lihat detail →
                      </span>
                    </div>
                  </Card>
                </div>
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
                    items.length
                  )}
                  {" dari "}
                  {items.length} aspirasi
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

      {/* Modal detail aspirasi */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeDetail();
            }
          }}
        >
          <div
            className="my-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aspirasi-detail-title"
          >
            {/* Header modal */}
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-inkFaint">
                  Detail Aspirasi
                </p>

                <h2
                  id="aspirasi-detail-title"
                  className="font-display text-xl font-bold text-navy"
                >
                  {selected.judul}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDetail}
                disabled={processing}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 transition hover:bg-gray-200 disabled:opacity-50"
                aria-label="Tutup modal"
              >
                ×
              </button>
            </div>

            {/* Informasi status */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge
                variant={statusVariant[selected.status] || "gray"}
              >
                {statusLabel[selected.status] || selected.status}
              </Badge>

              <Badge variant="navy">
                {selected.kategori}
              </Badge>
            </div>

            {/* Informasi penulis */}
            <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] text-inkFaint">
                  Pengirim
                </p>
                <p className="mt-1 text-[13px] font-semibold text-ink">
                  {selected.penulis?.nama || "Tidak diketahui"}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-inkFaint">
                  Kelas
                </p>
                <p className="mt-1 text-[13px] font-semibold text-ink">
                  {selected.kelas || selected.penulis?.kelas || "-"}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-inkFaint">
                  Tanggal pengajuan
                </p>
                <p className="mt-1 text-[13px] font-semibold text-ink">
                  {formatTanggal(selected.dibuatPada)}
                </p>
              </div>
            </div>

            {/* Isi aspirasi */}
            <div className="mb-5">
              <h3 className="mb-2 text-[13px] font-bold text-ink">
                Isi Aspirasi
              </h3>

              <div className="whitespace-pre-wrap rounded-xl border border-gray-200 p-4 text-[13.5px] leading-relaxed text-inkSoft">
                {selected.isi}
              </div>
            </div>

            {/* Balasan / progres */}
            {selected.balasan && (
              <div className="mb-5">
                <h3 className="mb-2 text-[13px] font-bold text-ink">
                  Pembaruan dari OSIS
                </h3>

                <div className="whitespace-pre-wrap rounded-xl border border-green-200 bg-green-50 p-4 text-[13.5px] leading-relaxed text-green-800">
                  {selected.balasan}
                </div>
              </div>
            )}

            {/* Alasan penolakan */}
            {selected.status === "DITOLAK" &&
              selected.alasan_penolakan && (
                <div className="mb-5">
                  <h3 className="mb-2 text-[13px] font-bold text-red-700">
                    Alasan Penolakan
                  </h3>

                  <div className="whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-[13.5px] leading-relaxed text-red-800">
                    {selected.alasan_penolakan}
                  </div>
                </div>
              )}

            {/* Pengelolaan khusus Pengurus */}
            {mode === "pengurus" && (
              <div className="mt-6 border-t border-gray-200 pt-5">
                <h3 className="mb-4 text-[14px] font-bold text-navy">
                  Pengelolaan Aspirasi
                </h3>

                {/* MENUNGGU */}
                {selected.status === "MENUNGGU" && (
                  <div>
                    <p className="mb-3 text-[13px] text-inkSoft">
                      Aspirasi baru masuk dan menunggu pemeriksaan Pengurus.
                    </p>

                    <Button
                      disabled={processing}
                      onClick={() =>
                        updateStatus(
                          selected.id_aspirasi,
                          "DITINJAU"
                        )
                      }
                    >
                      Mulai Tinjau
                    </Button>
                  </div>
                )}

                {/* DITINJAU */}
                {selected.status === "DITINJAU" && (
                  <div className="flex flex-col gap-4">
                    <p className="text-[13px] text-inkSoft">
                      Tentukan apakah aspirasi ini dapat diteruskan atau perlu ditolak.
                    </p>

                    <div>
                      <label className="mb-2 block text-[12px] font-semibold text-ink">
                        Alasan penolakan
                      </label>

                      <TextArea
                        placeholder="Isi alasan jika aspirasi ditolak..."
                        value={alasanPenolakan}
                        onChange={(e) =>
                          setAlasanPenolakan(e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        disabled={processing}
                        variant="success"
                        onClick={() =>
                          updateStatus(
                            selected.id_aspirasi,
                            "DISETUJUI"
                          )
                        }
                      >
                        Setujui
                      </Button>

                      <Button
                        disabled={processing}
                        variant="danger"
                        onClick={rejectAspirasi}
                      >
                        Tolak Aspirasi
                      </Button>
                    </div>
                  </div>
                )}

                {/* DISETUJUI */}
                {selected.status === "DISETUJUI" && (
                  <div>
                    <p className="mb-3 text-[13px] text-inkSoft">
                      Aspirasi telah disetujui. Pengurus dapat mulai melakukan tindak lanjut.
                    </p>

                    <Button
                      disabled={processing}
                      onClick={() =>
                        updateStatus(
                          selected.id_aspirasi,
                          "DITINDAKLANJUTI"
                        )
                      }
                    >
                      Mulai Tindak Lanjut
                    </Button>
                  </div>
                )}

                {/* DITINDAKLANJUTI */}
                {selected.status === "DITINDAKLANJUTI" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="mb-2 block text-[12px] font-semibold text-ink">
                        Perbarui progres / balasan
                      </label>

                      <TextArea
                        placeholder="Tuliskan perkembangan tindak lanjut aspirasi..."
                        value={progressDraft}
                        onChange={(e) =>
                          setProgressDraft(e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        disabled={processing}
                        variant="primary"
                        onClick={saveProgress}
                      >
                        Simpan Progres
                      </Button>

                      <Button
                        disabled={processing}
                        variant="success"
                        onClick={() =>
                          updateStatus(
                            selected.id_aspirasi,
                            "SELESAI",
                            progressDraft.trim()
                              ? { balasan: progressDraft.trim() }
                              : {}
                          )
                        }
                      >
                        Tandai Selesai
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status akhir */}
                {(selected.status === "SELESAI" ||
                  selected.status === "DITOLAK") && (
                  <p className="rounded-xl bg-gray-50 p-4 text-[13px] text-inkSoft">
                    Aspirasi ini telah mencapai status akhir. Tidak ada tindakan lanjutan yang tersedia.
                  </p>
                )}
              </div>
            )}

            {/* Footer modal untuk pengguna non-Pengurus */}
            {mode !== "pengurus" && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-[12.5px] text-inkFaint">
                  {selected.status === "SELESAI"
                    ? "Aspirasi ini telah selesai ditindaklanjuti."
                    : selected.status === "DITOLAK"
                      ? "Aspirasi ini tidak dapat dilanjutkan."
                      : "Kamu dapat memantau perkembangan aspirasi melalui halaman ini."}
                </p>
              </div>
            )}

            {/* Tombol tutup */}
            <div className="mt-5 flex justify-end">
              <Button
                variant="secondary"
                disabled={processing}
                onClick={closeDetail}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
