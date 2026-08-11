"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  EmptyState,
  StatBox,
  formatTanggal,
} from "@/components/dashboard/ui";

type AbsensiItem = {
  id_absensi: number;
  hadir: boolean;
  waktuHadir: string | null;
  event: { judul: string; tanggal: string };
};

type PoinItem = {
  id_poin: number;
  jumlah: number;
  keterangan: string;
  dibuatPada: string;
};

export default function AbsenModule() {
  const [absensi, setAbsensi] = useState<AbsensiItem[]>([]);
  const [poin, setPoin] = useState<PoinItem[]>([]);
  const [totalPoin, setTotalPoin] = useState(0);
  const [totalHadir, setTotalHadir] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/absen");
    const data = await res.json();
    if (data.absensi) setAbsensi(data.absensi);
    if (data.poin) setPoin(data.poin);
    setTotalPoin(data.totalPoin || 0);
    setTotalHadir(data.totalHadir || 0);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox label="Total Poin" value={totalPoin} hint="Poin keaktifanmu" tone="gold" />
        <StatBox label="Total Kehadiran" value={totalHadir} hint="Event yang kamu hadiri" tone="blue" />
        <StatBox label="Riwayat Poin" value={poin.length} hint="Catatan perolehan poin" tone="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-display text-[16px] font-bold text-navy">Riwayat Kehadiran</h3>
          {loading ? (
            <p className="text-[13.5px] text-inkFaint">Memuat data...</p>
          ) : absensi.length === 0 ? (
            <EmptyState message="Belum ada riwayat kehadiran." />
          ) : (
            <div className="flex flex-col gap-3">
              {absensi.map((a) => (
                <Card key={a.id_absensi}>
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={a.hadir ? "green" : "gray"}>
                      {a.hadir ? "Hadir" : "Tidak hadir"}
                    </Badge>
                    <span className="ml-auto text-[12px] text-inkFaint">
                      {a.waktuHadir ? formatTanggal(a.waktuHadir) : formatTanggal(a.event.tanggal)}
                    </span>
                  </div>
                  <div className="text-[14.5px] font-semibold text-ink">{a.event.judul}</div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 font-display text-[16px] font-bold text-navy">Riwayat Poin Keaktifan</h3>
          {loading ? (
            <p className="text-[13.5px] text-inkFaint">Memuat data...</p>
          ) : poin.length === 0 ? (
            <EmptyState message="Belum ada poin keaktifan." />
          ) : (
            <div className="flex flex-col gap-3">
              {poin.map((p) => (
                <Card key={p.id_poin}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[14px] font-semibold text-ink">{p.keterangan}</div>
                      <div className="text-[12px] text-inkFaint">{formatTanggal(p.dibuatPada)}</div>
                    </div>
                    <Badge variant="gold">+{p.jumlah} poin</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

