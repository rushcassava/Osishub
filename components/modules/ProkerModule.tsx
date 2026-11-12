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

type ProkerItem = {
  id_proker: number;
  judul: string;
  deskripsi: string;
  divisi: string;
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

export default function ProkerModule({ mode }: { mode: Mode }) {
  const [items, setItems] = useState<ProkerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [divisi, setDivisi] = useState("Acara");
  const [target, setTarget] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/proker");
    const data = await res.json();
    if (data.proker) setItems(data.proker);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setJudul("");
    setDeskripsi("");
    setDivisi("Acara");
    setTarget("");
    setFormError("");
  }

  function openForm() { resetForm(); setFormOpen(true); }
  function closeForm() { setFormOpen(false); resetForm(); }

  async function buatProker(e: React.FormEvent) {
    e.preventDefault();
    if (!judul || !deskripsi) return;
    setSubmitting(true);
    setFormError("");
    const res = await fetch("/api/proker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, deskripsi, divisi, targetSelesai: target || null }),
    });
    setSubmitting(false);
    if (res.ok) {
      closeForm();
      load();
    } else {
      const data = await res.json();
      setFormError(data.error || "Gagal membuat proker.");
    }
  }

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/proker/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  }

  const berjalan = items.filter((i) => i.status === "BERJALAN").length;
  const selesai = items.filter((i) => i.status === "SELESAI").length;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Stat Boxes ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox label="Total Proker" value={items.length} tone="default" />
        <StatBox label="Berjalan" value={berjalan} tone="blue" />
        <StatBox label="Selesai" value={selesai} tone="green" />
      </div>

      {/* ── Daftar Program Kerja ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[16px] font-bold text-navy">Daftar Program Kerja</h3>
          {mode === "pengurus" && (
            <Button onClick={openForm} className="gap-1.5">
              <span className="text-[16px] leading-none">+</span> Tambah Proker
            </Button>
          )}
        </div>
        {loading ? (
          <p className="text-[13.5px] text-inkFaint">Memuat data...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada proker." />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((p) => (
              <Card key={p.id_proker}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant[p.status] || "gray"}>{statusLabel[p.status] || p.status}</Badge>
                  <Badge variant="navy">{p.divisi}</Badge>
                  {p.targetSelesai && (
                    <span className="text-[12px] text-inkFaint">Target: {formatTanggal(p.targetSelesai)}</span>
                  )}
                  <span className="ml-auto text-[12px] text-inkFaint">oleh {p.pembuat.nama}</span>
                </div>
                <h4 className="mb-1 text-[15px] font-semibold text-ink">{p.judul}</h4>
                <p className="mb-3 text-[13.5px] leading-relaxed text-inkSoft">{p.deskripsi}</p>
                {mode === "pengurus" && (
                  <div className="flex flex-wrap gap-2 border-t border-[#E8EAF0] pt-3">
                    <Button variant="secondary" className="!py-2 text-[12.5px]" onClick={() => updateStatus(p.id_proker, "RENCANA")}>
                      Rencana
                    </Button>
                    <Button variant="secondary" className="!py-2 text-[12.5px]" onClick={() => updateStatus(p.id_proker, "BERJALAN")}>
                      Mulai
                    </Button>
                    <Button variant="success" className="!py-2 text-[12.5px]" onClick={() => updateStatus(p.id_proker, "SELESAI")}>
                      Selesai
                    </Button>
                    <Button variant="danger" className="!py-2 text-[12.5px]" onClick={() => updateStatus(p.id_proker, "DITUNDA")}>
                      Tunda
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Form Buat Proker ── */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title="Buat Proker Baru"
        size="lg"
      >
        <form onSubmit={buatProker} className="flex flex-col gap-4">
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
            <SelectInput label="Divisi" value={divisi} onChange={(e) => setDivisi(e.target.value)}>
              <option>Acara</option>
              <option>Media &amp; Informasi</option>
              <option>Kesejahteraan</option>
              <option>Keagamaan</option>
              <option>Olahraga</option>
              <option>Sekretaris</option>
              <option>Bendahara</option>
            </SelectInput>
          </div>
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
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{formError}</p>
          )}
          <div className="flex justify-end gap-2 border-t border-[#E8EAF0] pt-4">
            <Button type="button" variant="secondary" onClick={closeForm}>Batal</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Buat Proker"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
