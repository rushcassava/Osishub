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

export default function EventModule({ mode }: { mode: Mode }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Modal form pengurus
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [lokasi, setLokasi] = useState("");

  // QR Absensi Pengurus
  const [activeQrEvent, setActiveQrEvent] = useState<{ id: number; judul: string } | null>(null);
  const [qrToken, setQrToken] = useState("");
  const [qrError, setQrError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/event");
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch {
      setError("Gagal memuat data event.");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!activeQrEvent) {
      setQrToken("");
      return;
    }

    const currentEventId = activeQrEvent.id;

    async function fetchToken() {
      try {
        const res = await fetch(`/api/event/qr-token?eventId=${currentEventId}`);
        const data = await res.json();
        if (data.token) {
          setQrToken(data.token);
          setQrError("");
        } else {
          setQrError(data.error || "Gagal mengambil token.");
        }
      } catch {
        setQrError("Gagal terhubung ke server.");
      }
    }

    fetchToken();
    const interval = setInterval(fetchToken, 10000); // refresh every 10 seconds

    return () => clearInterval(interval);
  }, [activeQrEvent]);

  function resetForm() {
    setJudul("");
    setDeskripsi("");
    setTanggal("");
    setLokasi("");
  }

  function openForm() {
    resetForm();
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    resetForm();
  }

  async function buatEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!judul || !deskripsi || !tanggal || !lokasi) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul, deskripsi, tanggal, lokasi }),
      });
      if (res.ok) {
        setMessage("Event berhasil dibuat.");
        setTimeout(() => setMessage(""), 3000);
        closeForm();
        load();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal membuat event.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    }
    setSubmitting(false);
  }

  async function hapusEvent(event_id: number) {
    if (!confirm("Yakin ingin menghapus event ini?")) return;
    const res = await fetch(`/api/event/${event_id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Event dihapus.");
      setTimeout(() => setMessage(""), 3000);
      load();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Notifikasi Global */}
      {(message || error) && (
        <div className={`rounded-lg px-4 py-3 text-[13.5px] font-medium ${error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {error || message}
        </div>
      )}

      {/* ── Header & Tombol Tambah Event ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[16px] font-bold text-navy">
            {mode === "anggota" ? "Event OSIS" : "Semua Event"}
          </h3>
          {mode === "pengurus" && (
            <Button onClick={openForm} className="gap-1.5">
              <span className="text-[16px] leading-none">+</span> Buat Event Baru
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-[13.5px] text-inkFaint">Memuat data...</p>
        ) : events.length === 0 ? (
          <EmptyState message="Belum ada event." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {events.map((e) => {
              const sudahHadir = e.hadir;
              return (
                <Card key={e.id_event}>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={sudahHadir ? "green" : "gray"}>
                      {sudahHadir ? "Hadir" : "Belum Hadir"}
                    </Badge>
                  </div>
                  <h4 className="mb-1 text-[16px] font-semibold text-ink">{e.judul}</h4>
                  <p className="mb-2 text-[13px] leading-relaxed text-inkSoft">{e.deskripsi}</p>
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
                      {sudahHadir && <span className="text-[13px] font-semibold text-green-600">✓ Kamu sudah hadir</span>}
                    </div>
                  ) : (
                    <div className="flex gap-2 border-t border-[#E8EAF0] pt-3">
                      <Button variant="primary" className="!py-2 text-[12.5px]" onClick={() => setActiveQrEvent({ id: e.id_event, judul: e.judul })}>
                        Tampilkan QR Absen
                      </Button>
                      <Button variant="danger" className="!py-2 text-[12.5px]" onClick={() => hapusEvent(e.id_event)}>
                        Hapus
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal Form Buat Event Baru ── */}
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
            <Button type="button" variant="secondary" onClick={closeForm}>Batal</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Buat Event"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal QR Absensi ── */}
      {activeQrEvent && (
        <Modal open={!!activeQrEvent} onClose={() => setActiveQrEvent(null)} title={`QR Absensi: ${activeQrEvent.judul}`}>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <p className="mb-4 text-[13.5px] text-inkSoft font-medium">
              Minta anggota memindai QR Code di bawah menggunakan kamera HP untuk melakukan check-in mandiri.
            </p>
            {qrError ? (
              <p className="text-[14px] font-semibold text-red-600">{qrError}</p>
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
                  <span className="text-[12.5px] font-semibold text-emerald-600">QR Code aktif dan terus diperbarui</span>
                </div>
              </div>
            ) : (
              <p className="text-[13.5px] text-inkFaint">Menghasilkan QR Code...</p>
            )}
            <div className="mt-6 w-full">
              <Button variant="secondary" className="w-full" onClick={() => setActiveQrEvent(null)}>
                Tutup Layar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}