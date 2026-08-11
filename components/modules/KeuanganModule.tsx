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

export default function KeuanganModule({ mode }: { mode: Mode }) {
  const [transaksi, setTransaksi] = useState<TransaksiItem[]>([]);
  const [perKategori, setPerKategori] = useState<{ kategori: string; pemasukan: number; pengeluaran: number }[]>([]);
  const [ringkasan, setRingkasan] = useState({ pemasukan: 0, pengeluaran: 0, saldo: 0, total_transaksi: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [judul, setJudul] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [jenis, setJenis] = useState<"PEMASUKAN" | "PENGELUARAN">("PEMASUKAN");
  const [kategori, setKategori] = useState("Kas");
  const [keterangan, setKeterangan] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/keuangan");
    const data = await res.json();
    if (data.transaksi) setTransaksi(data.transaksi);
    if (data.ringkasan) setRingkasan(data.ringkasan);
    if (data.perKategori) setPerKategori(data.perKategori);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function catat(e: React.FormEvent) {
    e.preventDefault();
    if (!judul || !jumlah) return;
    if (kategori === "Lainnya" && !keterangan.trim()) {
      alert("Keterangan wajib diisi untuk kategori Lainnya.");
      return;
    }
    const res = await fetch("/api/keuangan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, jumlah, jenis, kategori, keterangan }),
    });
    if (res.ok) {
      setJudul("");
      setJumlah("");
      setKeterangan("");
      setMessage("Transaksi berhasil dicatat.");
      setTimeout(() => setMessage(""), 3000);
      load();
    }
  }

  async function hapus(id: number) {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    const res = await fetch(`/api/keuangan/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox label="Saldo Kas" value={formatRupiah(ringkasan.saldo)} tone={ringkasan.saldo >= 0 ? "green" : "red"} hint="Total pemasukan − pengeluaran" />
        <StatBox label="Pemasukan" value={formatRupiah(ringkasan.pemasukan)} tone="green" hint="Total dana masuk" />
        <StatBox label="Pengeluaran" value={formatRupiah(ringkasan.pengeluaran)} tone="red" hint="Total dana keluar" />
      </div>

      {mode === "pengurus" && (
        <FormPanel title="Catat Transaksi" subtitle="Pencatatan pemasukan dan pengeluaran organisasi.">
          <form onSubmit={catat} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput label="Judul / Uraian" placeholder="mis. Iuran kas bulanan" value={judul} onChange={(e) => setJudul(e.target.value)} required />
              <TextInput label="Jumlah (Rp)" type="number" min="0" placeholder="mis. 500000" value={jumlah} onChange={(e) => setJumlah(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectInput label="Jenis" value={jenis} onChange={(e) => setJenis(e.target.value as any)}>
                <option value="PEMASUKAN">Pemasukan</option>
                <option value="PENGELUARAN">Pengeluaran</option>
              </SelectInput>
              <SelectInput label="Kategori" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                <option>Kas</option>
                <option>Bantuan</option>
                <option>Operasional</option>
                <option>Event</option>
                <option>Sarana</option>
                <option>Lainnya</option>
              </SelectInput>
            </div>
            <TextArea 
              label={kategori === "Lainnya" ? "Keterangan (wajib diisi)" : "Keterangan (opsional)"} 
              value={keterangan} 
              onChange={(e) => setKeterangan(e.target.value)} 
              required={kategori === "Lainnya"}
            />
            <div className="flex items-center gap-3">
              <Button type="submit">Catat Transaksi</Button>
              {message && <span className="text-[13px] font-medium text-green-600">{message}</span>}
            </div>
          </form>
        </FormPanel>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-3 font-display text-[16px] font-bold text-navy">Riwayat Transaksi</h3>
          {loading ? (
            <p className="text-[13.5px] text-inkFaint">Memuat data...</p>
          ) : transaksi.length === 0 ? (
            <EmptyState message="Belum ada transaksi." />
          ) : (
            <Table
              head={["Tanggal", "Uraian", "Kategori", "Jumlah", mode === "pengurus" ? "Aksi" : ""]}
            >
              {transaksi.map((t) => (
                <tr key={t.id_transaksi}>
                  <td className="px-4 py-3 whitespace-nowrap text-inkFaint">{formatTanggal(t.tanggal)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{t.judul}</div>
                    <div className="text-[12px] text-inkFaint">{t.keterangan}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="navy">{t.kategori}</Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-semibold ${t.jenis === "PEMASUKAN" ? "text-green-600" : "text-red-600"}`}>
                      {t.jenis === "PEMASUKAN" ? "+" : "−"} {formatRupiah(t.jumlah)}
                    </span>
                  </td>
                  {mode === "pengurus" && (
                    <td className="px-4 py-3">
                      <Button variant="danger" className="!px-3 !py-1.5 text-[12px]" onClick={() => hapus(t.id_transaksi)}>
                        Hapus
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </Table>
          )}
        </div>

        <div>
          <h3 className="mb-3 font-display text-[16px] font-bold text-navy">Ringkasan per Kategori</h3>
          <div className="flex flex-col gap-3">
            {perKategori.map((k) => (
              <Card key={k.kategori}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-ink">{k.kategori}</span>
                  <Badge variant="gray">selisih {formatRupiah(k.pemasukan - k.pengeluaran)}</Badge>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-green-600">Masuk: {formatRupiah(k.pemasukan)}</span>
                  <span className="text-red-600">Keluar: {formatRupiah(k.pengeluaran)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

