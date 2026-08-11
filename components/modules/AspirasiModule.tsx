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
  Table,
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
  dibuatPada: string;
  penulis: { nama: string; kelas: string | null; peran: string };
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

export default function AspirasiModule({ mode }: { mode: Mode }) {
  const [items, setItems] = useState<AspirasiItem[]>([]);
  const [loading, setLoading] = useState(true);

  // form pengajuan aspirasi
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [kategori, setKategori] = useState("Umum");
  const [message, setMessage] = useState("");

  // form pengurus (balasan)
  const [balasanMap, setBalasanMap] = useState<Record<number, string>>({});
  const [catatanMap, setCatatanMap] = useState<Record<number, string>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/aspirasi");
    const data = await res.json();
    if (data.aspirasi) setItems(data.aspirasi);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitAspirasi(e: React.FormEvent) {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) return;
    const res = await fetch("/api/aspirasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, isi, kategori }),
    });
    if (res.ok) {
      setJudul("");
      setIsi("");
      setKategori("Umum");
      setMessage("Aspirasi berhasil diajukan.");
      setTimeout(() => setMessage(""), 3000);
      load();
    }
  }

  async function updateStatus(id: number, status: string, extra: Record<string, string> = {}) {
    const res = await fetch(`/api/aspirasi/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    if (res.ok) {
      load();
    } else {
      const data = await res.json();
      setMessage(data.error || "Gagal memperbarui.");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {mode === "submit" && (
        <FormPanel title="Ajukan Aspirasi" subtitle="Sampaikan masukan, kritik, atau usulanmu kepada OSIS.">
          <form onSubmit={submitAspirasi} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_220px]">
              <TextInput
                label="Judul"
                placeholder="mis. Penambahan jam buka perpustakaan"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />
              <SelectInput label="Kategori" value={kategori} onChange={(e) => setKategori(e.target.value)}>
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
            <div className="flex items-center gap-3">
              <Button type="submit">Kirim Aspirasi</Button>
              {message && <span className="text-[13px] font-medium text-green-600">{message}</span>}
            </div>
          </form>
        </FormPanel>
      )}

      <div>
        <h3 className="mb-3 font-display text-[16px] font-bold text-navy">
          {mode === "submit"
            ? "Aspirasiku"
            : mode === "review"
              ? "Aspirasi Kelas yang Masuk"
              : "Aspirasi Masuk"}
        </h3>

        {loading ? (
          <p className="text-[13.5px] text-inkFaint">Memuat data...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada aspirasi." />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((a) => (
              <Card key={a.id_aspirasi}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant[a.status] || "gray"}>{statusLabel[a.status] || a.status}</Badge>
                  <Badge variant="navy">{a.kategori}</Badge>
                  {mode !== "submit" && (
                    <span className="text-[12.5px] text-inkFaint">
                      dari {a.penulis.nama}
                      {a.kelas ? ` · ${a.kelas}` : ""}
                    </span>
                  )}
                  <span className="ml-auto text-[12px] text-inkFaint">{formatTanggal(a.dibuatPada)}</span>
                </div>

                <h4 className="mb-1 text-[15px] font-semibold text-ink">{a.judul}</h4>
                <p className="mb-3 text-[13.5px] leading-relaxed text-inkSoft">{a.isi}</p>

                {a.balasan && (
                  <div className="mb-3 rounded-[9px] border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-800">
                    <span className="font-semibold">Balasan OSIS: </span>
                    {a.balasan}
                  </div>
                )}

                {mode === "review" && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" className="!py-2 text-[12.5px]" onClick={() => updateStatus(a.id_aspirasi, "DITINJAU")}>
                      Tinjau
                    </Button>
                    <Button variant="success" className="!py-2 text-[12.5px]" onClick={() => updateStatus(a.id_aspirasi, "DISETUJUI")}>
                      Setujui & Teruskan
                    </Button>
                    <Button variant="danger" className="!py-2 text-[12.5px]" onClick={() => updateStatus(a.id_aspirasi, "DITOLAK")}>
                      Tolak
                    </Button>
                  </div>
                )}

                {mode === "pengurus" && (
                  <div className="flex flex-wrap items-end gap-2">
                    <TextInput
                      placeholder="Tulis balasan / tindak lanjut..."
                      value={balasanMap[a.id_aspirasi] || ""}
                      onChange={(e) => setBalasanMap((m) => ({ ...m, [a.id_aspirasi]: e.target.value }))}
                      className="!w-64"
                    />
                    <Button
                      variant="primary"
                      className="!py-2 text-[12.5px]"
                      onClick={() =>
                        updateStatus(a.id_aspirasi, "DITINDAKLANJUTI", {
                          balasan: balasanMap[a.id_aspirasi] || "",
                        })
                      }
                    >
                      Tindak Lanjuti
                    </Button>
                    <Button
                      variant="success"
                      className="!py-2 text-[12.5px]"
                      onClick={() =>
                        updateStatus(a.id_aspirasi, "SELESAI", {
                          balasan: balasanMap[a.id_aspirasi] || a.balasan || "",
                        })
                      }
                    >
                      Tandai Selesai
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

