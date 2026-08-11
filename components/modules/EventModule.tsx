"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FormPanel,
  SelectInput,
  TextArea,
  TextInput,
  formatTanggal,
  Modal,
} from "@/components/dashboard/ui";

type Mode = "anggota" | "pengurus";

type EventItem = {
  id_event: number;
  judul: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  kuota: number;
  jumlah_peserta: number;
  terdaftar: string | null;
};

export default function EventModule({ mode }: { mode: Mode }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // form pengurus
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [kuota, setKuota] = useState("50");

  // QR Absensi Pengurus
  const [activeQrEvent, setActiveQrEvent] = useState<{ id: number; judul: string } | null>(null);
  const [qrToken, setQrToken] = useState("");
  const [qrError, setQrError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/event");
    const data = await res.json();
    if (data.events) setEvents(data.events);
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
      } catch (err) {
        setQrError("Gagal terhubung ke server.");
      }
    }

    fetchToken();
    const interval = setInterval(fetchToken, 10000); // refresh every 10 seconds

    return () => clearInterval(interval);
  }, [activeQrEvent]);

  async function buatEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!judul || !deskripsi || !tanggal || !lokasi) return;
    const res = await fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, deskripsi, tanggal, lokasi, kuota }),
    });
    if (res.ok) {
      setJudul("");
      setDeskripsi("");
      setTanggal("");
      setLokasi("");
      setKuota("50");
      setMessage("Event berhasil dibuat.");
      setTimeout(() => setMessage(""), 3000);
      load();
    }
  }

  async function daftar(event_id: number) {
    const res = await fetch("/api/event/daftar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id }),
    });
    const data = await res.json();
    setMessage(data.error || "Pendaftaran berhasil!");
    setTimeout(() => setMessage(""), 3000);
    if (res.ok) load();
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
      {mode === "pengurus" && (
        <FormPanel title="Buat Event Baru" subtitle="Event yang dibuat akan langsung terlihat oleh seluruh anggota.">
          <form onSubmit={buatEvent} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput label="Judul Event" placeholder="mis. Latihan Dasar Kepemimpinan" value={judul} onChange={(e) => setJudul(e.target.value)} required />
              <TextInput label="Lokasi" placeholder="mis. Aula Utama" value={lokasi} onChange={(e) => setLokasi(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput label="Tanggal & Waktu" type="datetime-local" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
              <SelectInput label="Kuota Peserta" value={kuota} onChange={(e) => setKuota(e.target.value)}>
                <option value="20">20</option>
                <option value="40">40</option>
                <option value="50">50</option>
                <option value="80">80</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </SelectInput>
            </div>
            <TextArea label="Deskripsi" placeholder="Deskripsi singkat kegiatan..." value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} required />
            <div className="flex items-center gap-3">
              <Button type="submit">Buat Event</Button>
              {message && <span className="text-[13px] font-medium text-green-600">{message}</span>}
            </div>
          </form>
        </FormPanel>
      )}

      <div>
        <h3 className="mb-3 font-display text-[16px] font-bold text-navy">
          {mode === "anggota" ? "Event OSIS" : "Semua Event"}
        </h3>

        {loading ? (
          <p className="text-[13.5px] text-inkFaint">Memuat data...</p>
        ) : events.length === 0 ? (
          <EmptyState message="Belum ada event." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {events.map((e) => {
              const sudahHadir = e.terdaftar === "HADIR";
              const sudahDaftar = e.terdaftar === "TERDAFTAR";
              const penuh = e.jumlah_peserta >= e.kuota;
              return (
                <Card key={e.id_event}>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={sudahHadir ? "green" : sudahDaftar ? "blue" : "gray"}>
                      {sudahHadir ? "Hadir" : sudahDaftar ? "Terdaftar" : "Belum daftar"}
                    </Badge>
                    <span className="text-[12.5px] text-inkFaint">
                      {e.jumlah_peserta}/{e.kuota} peserta
                    </span>
                  </div>
                  <h4 className="mb-1 text-[16px] font-semibold text-ink">{e.judul}</h4>
                  <p className="mb-2 text-[13px] leading-relaxed text-inkSoft">{e.deskripsi}</p>
                  <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-inkSoft">
                    <span>📅 {formatTanggal(e.tanggal)}</span>
                    <span>📍 {e.lokasi}</span>
                  </div>

                  {mode === "anggota" ? (
                    <div className="flex flex-wrap gap-2">
                      {!sudahDaftar && !sudahHadir && (
                        <Button variant="primary" className="!py-2 text-[12.5px]" disabled={penuh} onClick={() => daftar(e.id_event)}>
                          {penuh ? "Kuota Penuh" : "Daftar Sekarang"}
                        </Button>
                      )}
                      {sudahDaftar && (
                        <span className="text-[13px] font-semibold text-blue">
                          Silakan scan QR Code di layar Panitia untuk check-in
                        </span>
                      )}
                      {sudahHadir && <span className="text-[13px] font-semibold text-green-600">✓ Kamu sudah hadir</span>}
                    </div>
                  ) : (
                    <div className="flex gap-2">
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

