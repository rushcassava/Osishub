
"use client";

import { useEffect, useState } from "react";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  TextArea,
  TextInput,
  formatTanggal,
} from "@/components/dashboard/ui";

type Mode = "anggota" | "pengurus";

type EventItem = {
  id_event: number;
  judul: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  hadir: boolean;
};

type AnggotaAbsensi = {
  id_pengguna: number;
  nama: string;
  username: string;
  kelas: string | null;
  hadir: boolean;
  waktuHadir: string | null;
};

type AttendanceData = {
  event: {
    id_event: number;
    judul: string;
    deskripsi: string;
    tanggal: string;
    lokasi: string;
  };
  statistik: {
    totalAnggota: number;
    totalHadir: number;
    totalBelumHadir: number;
    persentaseKehadiran: number;
  };
  anggota: AnggotaAbsensi[];
};

// Durasi event: 2 jam
const DURASI_ABSENSI = 2 * 60 * 60 * 1000;

// Maksimal event per halaman
const ITEMS_PER_PAGE = 6;

// Mengurutkan event berdasarkan tanggal terbaru
function sortEvents(events: EventItem[]) {
  return [...events].sort((a, b) => {
    const waktuA = new Date(a.tanggal).getTime();
    const waktuB = new Date(b.tanggal).getTime();

    if (Number.isNaN(waktuA) || Number.isNaN(waktuB)) {
      return 0;
    }

    return waktuB - waktuA;
  });
}

// Format waktu check-in
function formatWaktuHadir(waktu: string | null) {
  if (!waktu) return "-";

  return new Date(waktu).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Memeriksa apakah masa absensi event sudah berakhir
function isEventSelesai(tanggal: string, waktuSekarang = Date.now()) {
  const waktuMulai = new Date(tanggal).getTime();

  return (
    Number.isFinite(waktuMulai) &&
    waktuSekarang >= waktuMulai + DURASI_ABSENSI
  );
}

export default function EventModule({ mode }: { mode: Mode }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal form pengurus
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [lokasi, setLokasi] = useState("");

  // Detail pengelolaan event
  const [selectedEvent, setSelectedEvent] =
    useState<EventItem | null>(null);

  // QR Absensi Pengurus
  const [activeQrEvent, setActiveQrEvent] = useState<{
    id: number;
    judul: string;
    tanggal: string;
  } | null>(null);

  const [qrToken, setQrToken] = useState("");
  const [qrError, setQrError] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Detail kehadiran
  const [attendanceEvent, setAttendanceEvent] = useState<{
    id: number;
    judul: string;
  } | null>(null);

  const [attendanceData, setAttendanceData] =
    useState<AttendanceData | null>(null);

  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

  // Memuat event
  async function load() {
    setLoading(true);

    try {
      const res = await fetch("/api/event");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal memuat data event.");
        return;
      }

      if (data.events) {
        setEvents(sortEvents(data.events));
      }
    } catch {
      setError("Gagal memuat data event.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Memperbarui waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sortedEvents = sortEvents(events);

  // Filter event berdasarkan pencarian
  const filteredEvents = sortedEvents.filter((event) => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) return true;

    return (
      event.judul.toLowerCase().includes(keyword) ||
      event.deskripsi.toLowerCase().includes(keyword) ||
      event.lokasi.toLowerCase().includes(keyword)
    );
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredEvents.length / ITEMS_PER_PAGE
  );

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const paginatedEvents = filteredEvents.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Membuka detail pengelolaan event
  function bukaDetailEvent(event: EventItem) {
    setSelectedEvent(event);
    setError("");
  }

  function tutupDetailEvent() {
    setSelectedEvent(null);
  }

  // Mengambil detail kehadiran anggota
  async function bukaDetailKehadiran(event: EventItem) {
    setAttendanceEvent({
      id: event.id_event,
      judul: event.judul,
    });

    setAttendanceData(null);
    setAttendanceError("");
    setAttendanceLoading(true);

    try {
      const res = await fetch(
        `/api/event/${event.id_event}/attendance`
      );

      const data = await res.json();

      if (!res.ok) {
        setAttendanceError(
          data.error || "Gagal mengambil data kehadiran."
        );
        return;
      }

      setAttendanceData(data);
    } catch {
      setAttendanceError(
        "Terjadi kesalahan saat menghubungi server."
      );
    } finally {
      setAttendanceLoading(false);
    }
  }

  function tutupDetailKehadiran() {
    setAttendanceEvent(null);
    setAttendanceData(null);
    setAttendanceError("");
  }

  // QR Token
  useEffect(() => {
    if (!activeQrEvent) {
      setQrToken("");
      setQrError("");
      return;
    }

    const currentEventId = activeQrEvent.id;
    const eventTanggal = activeQrEvent.tanggal;

    async function fetchToken() {
      try {
        // Menghentikan pengambilan QR setelah masa absensi berakhir
        if (isEventSelesai(eventTanggal)) {
          setQrToken("");
          setQrError("Masa absensi event telah berakhir.");
          return;
        }

        const res = await fetch(
          `/api/event/qr-token?eventId=${currentEventId}`
        );

        const data = await res.json();

        if (data.token) {
          setQrToken(data.token);
          setQrError("");
        } else {
          setQrToken("");
          setQrError(data.error || "Gagal mengambil token.");
        }
      } catch {
        setQrError("Gagal terhubung ke server.");
      }
    }

    fetchToken();

    const interval = setInterval(fetchToken, 10000);

    return () => clearInterval(interval);
  }, [activeQrEvent]);

  // Membuka QR dari modal detail
  function bukaQr(event: EventItem) {
    setSelectedEvent(null);

    setQrToken("");
    setQrError("");

    setActiveQrEvent({
      id: event.id_event,
      judul: event.judul,
      tanggal: event.tanggal,
    });
  }

  // Membuka detail kehadiran dari modal detail
  function bukaAttendance(event: EventItem) {
    setSelectedEvent(null);
    bukaDetailKehadiran(event);
  }

  function resetForm() {
    setJudul("");
    setDeskripsi("");
    setTanggal("");
    setLokasi("");
  }

  function openForm() {
    resetForm();
    setError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    resetForm();
  }

  // Membuat event baru
  async function buatEvent(e: React.FormEvent) {
    e.preventDefault();

    if (!judul || !deskripsi || !tanggal || !lokasi) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judul,
          deskripsi,
          tanggal,
          lokasi,
        }),
      });

      if (res.ok) {
        setMessage("Event berhasil dibuat.");
        setTimeout(() => setMessage(""), 3000);

        closeForm();
        setCurrentPage(1);

        await load();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal membuat event.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  }

  // Menghapus event
  async function hapusEvent(event_id: number): Promise<boolean> {
    const event = events.find((e) => e.id_event === event_id);

    if (event && isEventSelesai(event.tanggal)) {
      setError("Event sudah selesai dan tidak dapat dihapus.");
      return false;
    }

    if (!confirm("Yakin ingin menghapus event ini?")) {
      return false;
    }

    setError("");

    try {
      const res = await fetch(`/api/event/${event_id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Event berhasil dihapus.");
        setTimeout(() => setMessage(""), 3000);

        setSelectedEvent(null);

        await load();

        return true;
      } else {
        setError(data.error || "Gagal menghapus event.");
        return false;
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
      return false;
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

      {/* Header */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[16px] font-bold text-navy">
            {mode === "anggota" ? "Event OSIS" : "Semua Event"}
          </h3>

          {mode === "pengurus" && (
            <Button onClick={openForm} className="gap-1.5">
              <span className="text-[16px] leading-none">+</span>
              Buat Event Baru
            </Button>
          )}
        </div>

        {/* Pencarian Event */}
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
            placeholder="Cari judul, deskripsi, atau lokasi event..."
            className="w-full rounded-[9px] border border-[#E8EAF0] bg-white py-3 pl-10 pr-4 text-[13px] text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10"
          />
        </div>

        {/* Daftar Event */}
        {loading ? (
          <p className="text-[13.5px] text-inkFaint">
            Memuat data...
          </p>
        ) : sortedEvents.length === 0 ? (
          <EmptyState message="Belum ada event." />
        ) : filteredEvents.length === 0 ? (
          <EmptyState message="Event tidak ditemukan. Coba gunakan kata kunci lain." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {paginatedEvents.map((e) => {
              const sudahHadir = e.hadir;
              const eventSudahSelesai = isEventSelesai(
                e.tanggal,
                currentTime
              );

              return (
                <Card key={e.id_event}>
                  {/* Status hanya untuk anggota */}
                  {mode === "anggota" && (
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant={sudahHadir ? "green" : "gray"}>
                        {sudahHadir ? "Hadir" : "Belum Hadir"}
                      </Badge>
                    </div>
                  )}

                  <h4 className="mb-1 text-[16px] font-semibold text-ink">
                    {e.judul}
                  </h4>

                  <p className="mb-2 text-[13px] leading-relaxed text-inkSoft">
                    {e.deskripsi}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-inkSoft">
                    <span>📅 {formatTanggal(e.tanggal)}</span>
                    <span>📍 {e.lokasi}</span>
                  </div>

                  {mode === "anggota" ? (
                    <div className="flex flex-wrap gap-2">
                      {!sudahHadir && (
                        <span className="text-[13px] font-semibold text-blue">
                          Silakan scan QR Code di layar Panitia untuk check-in
                        </span>
                      )}

                      {sudahHadir && (
                        <span className="text-[13px] font-semibold text-green-600">
                          ✓ Kamu sudah hadir
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="border-t border-[#E8EAF0] pt-3">
                      <Button
                        variant="primary"
                        className="w-full !py-2.5 text-[13px]"
                        onClick={() => bukaDetailEvent(e)}
                      >
                        Detail Event
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
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
                filteredEvents.length
              )}
              {" dari "}
              {filteredEvents.length} event
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

      {/* Modal Buat Event */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title="Buat Event Baru"
        size="lg"
      >
        <form onSubmit={buatEvent} className="flex flex-col gap-4">
          <p className="text-[13px] text-inkSoft">
            Event yang dibuat akan langsung terlihat oleh seluruh anggota.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Judul Event"
              placeholder="mis. Latihan Dasar Kepemimpinan"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />

            <TextInput
              label="Lokasi"
              placeholder="mis. Aula Utama"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <TextInput
              label="Tanggal & Waktu"
              type="datetime-local"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>

          <TextArea
            label="Deskripsi"
            placeholder="Deskripsi singkat kegiatan..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 border-t border-[#E8EAF0] pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeForm}
            >
              Batal
            </Button>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Buat Event"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail dan Pengelolaan Event */}
      {selectedEvent && (
        <Modal
          open={!!selectedEvent}
          onClose={tutupDetailEvent}
          title="Detail Event"
          size="lg"
        >
          <div className="flex flex-col gap-5">
            {/* Informasi Event */}
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h4 className="text-[17px] font-bold text-navy">
                  {selectedEvent.judul}
                </h4>

                {isEventSelesai(
                  selectedEvent.tanggal,
                  currentTime
                ) ? (
                  <Badge variant="gray">Absensi Berakhir</Badge>
                ) : (
                  <Badge variant="green">Masa Absensi Aktif</Badge>
                )}
              </div>

              <p className="text-[13.5px] leading-relaxed text-inkSoft">
                {selectedEvent.deskripsi}
              </p>

              <div className="mt-4 flex flex-col gap-2 rounded-xl border border-[#E8EAF0] bg-[#FAFBFD] p-4 text-[13px] text-inkSoft">
                <span>📅 {formatTanggal(selectedEvent.tanggal)}</span>
                <span>📍 {selectedEvent.lokasi}</span>
                <span>
                  ⏱️ Durasi absensi: 2 jam sejak waktu mulai event
                </span>
              </div>
            </div>

            {/* Menu Pengelolaan */}
            <div>
              <h4 className="mb-3 text-[13px] font-bold text-ink">
                Pengelolaan Event
              </h4>

              <div className="flex flex-col gap-3">
                {/* QR Absensi */}
                <div className="flex items-center gap-3 rounded-xl border border-[#E8EAF0] p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue">
                    <span className="text-xl">▦</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-ink">
                      QR Absensi
                    </p>
                    <p className="text-[11.5px] text-inkSoft">
                      Tampilkan QR Code untuk check-in anggota.
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    disabled={isEventSelesai(
                      selectedEvent.tanggal,
                      currentTime
                    )}
                    onClick={() => bukaQr(selectedEvent)}
                  >
                    Tampilkan
                  </Button>
                </div>

                {/* Detail Kehadiran */}
                <div className="flex items-center gap-3 rounded-xl border border-[#E8EAF0] p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <span className="text-xl">♙</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-ink">
                      Detail Kehadiran
                    </p>
                    <p className="text-[11.5px] text-inkSoft">
                      Lihat statistik dan daftar kehadiran anggota.
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => bukaAttendance(selectedEvent)}
                  >
                    Lihat
                  </Button>
                </div>

                {/* Hapus Event */}
                <div className="flex items-center gap-3 rounded-xl border border-red-100 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <span className="text-xl">⌫</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-ink">
                      Hapus Event
                    </p>
                    <p className="text-[11.5px] text-inkSoft">
                      Menghapus event dari sistem.
                    </p>
                  </div>

                  <Button
                    variant="danger"
                    disabled={isEventSelesai(
                      selectedEvent.tanggal,
                      currentTime
                    )}
                    className={
                      isEventSelesai(
                        selectedEvent.tanggal,
                        currentTime
                      )
                        ? "!bg-gray-400 !text-white !border-gray-400 !cursor-not-allowed !opacity-100"
                        : ""
                    }
                    onClick={() => hapusEvent(selectedEvent.id_event)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>

              {isEventSelesai(
                selectedEvent.tanggal,
                currentTime
              ) && (
                <p className="mt-3 rounded-lg bg-gray-100 px-3 py-2 text-[12px] text-gray-600">
                  Masa absensi event telah berakhir. QR tidak dapat
                  ditampilkan dan event tidak dapat dihapus.
                </p>
              )}
            </div>

            <div className="flex justify-end border-t border-[#E8EAF0] pt-4">
              <Button
                variant="secondary"
                onClick={tutupDetailEvent}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Detail Kehadiran */}
      {attendanceEvent && (
        <Modal
          open={!!attendanceEvent}
          onClose={tutupDetailKehadiran}
          title={`Detail Kehadiran: ${attendanceEvent.judul}`}
          size="lg"
        >
          <div className="flex flex-col gap-5">
            {attendanceLoading ? (
              <p className="py-8 text-center text-[13.5px] text-inkFaint">
                Memuat data kehadiran anggota...
              </p>
            ) : attendanceError ? (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
                {attendanceError}
              </div>
            ) : attendanceData ? (
              <>
                {/* Informasi Event */}
                <div className="rounded-xl border border-[#E8EAF0] bg-[#FAFBFD] p-4">
                  <h4 className="mb-2 font-semibold text-ink">
                    Informasi Event
                  </h4>

                  <p className="mb-2 text-[13px] text-inkSoft">
                    {attendanceData.event.deskripsi}
                  </p>

                  <div className="flex flex-col gap-1 text-[12.5px] text-inkSoft">
                    <span>
                      📅 {formatTanggal(attendanceData.event.tanggal)}
                    </span>
                    <span>📍 {attendanceData.event.lokasi}</span>
                  </div>
                </div>

                {/* Statistik */}
                <div>
                  <h4 className="mb-3 font-semibold text-ink">
                    Statistik Kehadiran Anggota
                  </h4>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-[#E8EAF0] p-3">
                      <p className="text-[11px] text-inkSoft">
                        Total Anggota
                      </p>
                      <p className="mt-1 text-2xl font-bold text-navy">
                        {attendanceData.statistik.totalAnggota}
                      </p>
                    </div>

                    <div className="rounded-xl border border-green-100 bg-green-50 p-3">
                      <p className="text-[11px] text-green-700">
                        Hadir
                      </p>
                      <p className="mt-1 text-2xl font-bold text-green-700">
                        {attendanceData.statistik.totalHadir}
                      </p>
                    </div>

                    <div className="rounded-xl border border-red-100 bg-red-50 p-3">
                      <p className="text-[11px] text-red-700">
                        Belum Hadir
                      </p>
                      <p className="mt-1 text-2xl font-bold text-red-700">
                        {attendanceData.statistik.totalBelumHadir}
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                      <p className="text-[11px] text-blue-700">
                        Persentase
                      </p>
                      <p className="mt-1 text-2xl font-bold text-blue">
                        {attendanceData.statistik.persentaseKehadiran}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Daftar Hadir */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-ink">
                      Anggota Hadir
                    </h4>
                    <Badge variant="green">
                      {attendanceData.statistik.totalHadir} Orang
                    </Badge>
                  </div>

                  {attendanceData.anggota.filter((a) => a.hadir).length === 0 ? (
                    <EmptyState message="Belum ada anggota yang melakukan check-in." />
                  ) : (
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-[#E8EAF0]">
                      {attendanceData.anggota
                        .filter((a) => a.hadir)
                        .map((anggota) => (
                          <div
                            key={anggota.id_pengguna}
                            className="flex flex-col gap-1 border-b border-[#E8EAF0] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-[13px] font-semibold text-ink">
                                {anggota.nama}
                              </p>
                              <p className="text-[11.5px] text-inkSoft">
                                {anggota.kelas || "Kelas belum diisi"}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <Badge variant="green">Hadir</Badge>
                              <p className="mt-1 text-[11px] text-inkFaint">
                                {formatWaktuHadir(anggota.waktuHadir)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Daftar Belum Hadir */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-ink">
                      Anggota Belum Hadir
                    </h4>
                    <Badge variant="gray">
                      {attendanceData.statistik.totalBelumHadir} Orang
                    </Badge>
                  </div>

                  {attendanceData.anggota.filter((a) => !a.hadir).length === 0 ? (
                    <EmptyState message="Semua anggota sudah melakukan check-in." />
                  ) : (
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-[#E8EAF0]">
                      {attendanceData.anggota
                        .filter((a) => !a.hadir)
                        .map((anggota) => (
                          <div
                            key={anggota.id_pengguna}
                            className="flex items-center justify-between gap-3 border-b border-[#E8EAF0] px-4 py-3 last:border-b-0"
                          >
                            <div>
                              <p className="text-[13px] font-semibold text-ink">
                                {anggota.nama}
                              </p>
                              <p className="text-[11.5px] text-inkSoft">
                                {anggota.kelas || "Kelas belum diisi"}
                              </p>
                            </div>

                            <Badge variant="gray">Belum Hadir</Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}

            <div className="flex justify-end border-t border-[#E8EAF0] pt-4">
              <Button
                variant="secondary"
                onClick={tutupDetailKehadiran}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal QR Absensi */}
      {activeQrEvent && (
        <Modal
          open={!!activeQrEvent}
          onClose={() => setActiveQrEvent(null)}
          title={`QR Absensi: ${activeQrEvent.judul}`}
        >
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <p className="mb-4 text-[13.5px] font-medium text-inkSoft">
              Minta anggota memindai QR Code di bawah menggunakan kamera HP untuk melakukan check-in mandiri.
            </p>

            {isEventSelesai(
              activeQrEvent.tanggal,
              currentTime
            ) ? (
              <div className="rounded-xl bg-gray-100 px-5 py-4">
                <p className="text-[14px] font-semibold text-gray-600">
                  Masa absensi telah berakhir.
                </p>
                <p className="mt-1 text-[12px] text-gray-500">
                  QR Code tidak dapat ditampilkan kembali.
                </p>
              </div>
            ) : qrError ? (
              <p className="text-[14px] font-semibold text-red-600">
                {qrError}
              </p>
            ) : qrToken ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-xl border border-[#E8EAF0] bg-white p-4 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      `${window.location.origin}/dashboard/scan?token=${qrToken}`
                    )}`}
                    alt="QR Code Absen"
                    className="h-[240px] w-[240px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  </span>

                  <span className="text-[12.5px] font-semibold text-emerald-600">
                    QR Code aktif dan terus diperbarui
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[13.5px] text-inkFaint">
                Menghasilkan QR Code...
              </p>
            )}

            <div className="mt-6 w-full">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setActiveQrEvent(null)}
              >
                Tutup Layar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
