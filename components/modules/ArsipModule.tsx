"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FormPanel,
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

  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("Notulen");
  const [deskripsi, setDeskripsi] = useState("");
  const [fileNama, setFileNama] = useState("");
  const [url, setUrl] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/arsip");
    const data = await res.json();
    if (data.arsip) setItems(data.arsip);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!judul || !fileNama || !url) return;
    const res = await fetch("/api/arsip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, kategori, deskripsi, file_nama: fileNama, url }),
    });
    if (res.ok) {
      setJudul("");
      setDeskripsi("");
      setFileNama("");
      setUrl("");
      setMessage("Arsip berhasil disimpan.");
      setTimeout(() => setMessage(""), 3000);
      load();
    }
  }

  async function hapus(id: number) {
    if (!confirm("Yakin ingin menghapus arsip ini?")) return;
    const res = await fetch(`/api/arsip/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox label="Total Arsip" value={items.length} tone="default" />
        <StatBox label="Notulen" value={items.filter((i) => i.kategori === "Notulen").length} tone="blue" />
        <StatBox label="Dokumentasi" value={items.filter((i) => i.kategori === "Dokumentasi").length} tone="gold" />
      </div>

      <FormPanel title="Simpan Arsip Baru" subtitle="Dokumen, notulen, surat, dan hasil rapat tersimpan rapi.">
        <form onSubmit={simpan} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_220px]">
            <TextInput label="Judul Dokumen" placeholder="mis. Notulen Rapat Pengurus #12" value={judul} onChange={(e) => setJudul(e.target.value)} required />
            <SelectInput label="Kategori" value={kategori} onChange={(e) => setKategori(e.target.value)}>
              <option>Notulen</option>
              <option>Dokumentasi</option>
              <option>Surat</option>
              <option>Laporan</option>
              <option>Lainnya</option>
            </SelectInput>
          </div>
          <TextArea label="Deskripsi (opsional)" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput label="Nama / Format File" placeholder="mis. PDF / Google Drive Document" value={fileNama} onChange={(e) => setFileNama(e.target.value)} required />
            <TextInput label="URL / Link Dokumen (Google Drive, dll)" placeholder="mis. https://drive.google.com/..." value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit">Simpan Arsip</Button>
            {message && <span className="text-[13px] font-medium text-green-600">{message}</span>}
          </div>
        </form>
      </FormPanel>

      <div>
        <h3 className="mb-3 font-display text-[16px] font-bold text-navy">Daftar Arsip</h3>
        {loading ? (
          <p className="text-[13.5px] text-inkFaint">Memuat data...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada arsip." />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((a) => (
              <Card key={a.id_arsip}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="navy">{a.kategori}</Badge>
                  {a.file_nama && <Badge variant="gray">{a.file_nama}</Badge>}
                  <span className="ml-auto text-[12px] text-inkFaint">
                    {formatTanggal(a.dibuatPada)} · oleh {a.pembuat.nama}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-[15px] font-semibold text-ink">{a.judul}</h4>
                    {a.deskripsi && <p className="mt-0.5 text-[13px] text-inkSoft">{a.deskripsi}</p>}
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
                  <Button variant="danger" className="shrink-0 !px-3 !py-1.5 text-[12px]" onClick={() => hapus(a.id_arsip)}>
                    Hapus
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

