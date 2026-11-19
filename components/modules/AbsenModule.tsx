
"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
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

const ITEMS_PER_PAGE = 5;

export default function AbsenModule() {
  const [absensi, setAbsensi] = useState<AbsensiItem[]>([]);
  const [poin, setPoin] = useState<PoinItem[]>([]);
  const [totalPoin, setTotalPoin] = useState(0);
  const [totalHadir, setTotalHadir] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination riwayat kehadiran
  const [absensiPage, setAbsensiPage] = useState(1);

  // Pagination riwayat poin
  const [poinPage, setPoinPage] = useState(1);

  async function load() {
    setLoading(true);

    try {
      const res = await fetch("/api/absen");
      const data = await res.json();

      if (res.ok) {
        if (data.absensi) setAbsensi(data.absensi);
        if (data.poin) setPoin(data.poin);

        setTotalPoin(data.totalPoin || 0);
        setTotalHadir(data.totalHadir || 0);
      }
    } catch (error) {
      console.error("Gagal memuat data absensi:", error);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Pagination kehadiran
  const absensiTotalPages = Math.ceil(
    absensi.length / ITEMS_PER_PAGE
  );

  const safeAbsensiPage = Math.min(
    absensiPage,
    Math.max(absensiTotalPages, 1)
  );

  const paginatedAbsensi = absensi.slice(
    (safeAbsensiPage - 1) * ITEMS_PER_PAGE,
    safeAbsensiPage * ITEMS_PER_PAGE
  );

  // Pagination poin
  const poinTotalPages = Math.ceil(
    poin.length / ITEMS_PER_PAGE
  );

  const safePoinPage = Math.min(
    poinPage,
    Math.max(poinTotalPages, 1)
  );

  const paginatedPoin = poin.slice(
    (safePoinPage - 1) * ITEMS_PER_PAGE,
    safePoinPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Statistik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox
          label="Total Poin"
          value={totalPoin}
          hint="Poin keaktifanmu"
          tone="gold"
        />

        <StatBox
          label="Total Kehadiran"
          value={totalHadir}
          hint="Event yang kamu hadiri"
          tone="blue"
        />

        <StatBox
          label="Riwayat Poin"
          value={poin.length}
          hint="Catatan perolehan poin"
          tone="green"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Riwayat Kehadiran */}
        <div>
          <h3 className="mb-3 font-display text-[16px] font-bold text-navy">
            Riwayat Kehadiran
          </h3>

          {loading ? (
            <p className="text-[13.5px] text-inkFaint">
              Memuat data...
            </p>
          ) : absensi.length === 0 ? (
            <EmptyState message="Belum ada riwayat kehadiran." />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {paginatedAbsensi.map((a) => (
                  <Card key={a.id_absensi}>
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant={a.hadir ? "green" : "gray"}>
                        {a.hadir ? "Hadir" : "Tidak hadir"}
                      </Badge>

                      <span className="ml-auto text-[12px] text-inkFaint">
                        {a.waktuHadir
                          ? formatTanggal(a.waktuHadir)
                          : formatTanggal(a.event.tanggal)}
                      </span>
                    </div>

                    <div className="text-[14.5px] font-semibold text-ink">
                      {a.event.judul}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination Kehadiran */}
              {absensiTotalPages > 1 && (
                <div className="mt-4 flex flex-col gap-3">
                  <p className="text-[12px] text-inkFaint">
                    Menampilkan{" "}
                    {(safeAbsensiPage - 1) * ITEMS_PER_PAGE + 1}
                    {" - "}
                    {Math.min(
                      safeAbsensiPage * ITEMS_PER_PAGE,
                      absensi.length
                    )}
                    {" dari "}
                    {absensi.length} riwayat
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      disabled={safeAbsensiPage === 1}
                      onClick={() =>
                        setAbsensiPage((prev) =>
                          Math.max(prev - 1, 1)
                        )
                      }
                    >
                      Sebelumnya
                    </Button>

                    <span className="text-[13px] font-medium text-ink">
                      {safeAbsensiPage} / {absensiTotalPages}
                    </span>

                    <Button
                      variant="secondary"
                      disabled={
                        safeAbsensiPage === absensiTotalPages
                      }
                      onClick={() =>
                        setAbsensiPage((prev) =>
                          Math.min(
                            prev + 1,
                            absensiTotalPages
                          )
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

        {/* Riwayat Poin */}
        <div>
          <h3 className="mb-3 font-display text-[16px] font-bold text-navy">
            Riwayat Poin Keaktifan
          </h3>

          {loading ? (
            <p className="text-[13.5px] text-inkFaint">
              Memuat data...
            </p>
          ) : poin.length === 0 ? (
            <EmptyState message="Belum ada poin keaktifan." />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {paginatedPoin.map((p) => (
                  <Card key={p.id_poin}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[14px] font-semibold text-ink">
                          {p.keterangan}
                        </div>

                        <div className="text-[12px] text-inkFaint">
                          {formatTanggal(p.dibuatPada)}
                        </div>
                      </div>

                      <Badge variant="gold">
                        +{p.jumlah} poin
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination Poin */}
              {poinTotalPages > 1 && (
                <div className="mt-4 flex flex-col gap-3">
                  <p className="text-[12px] text-inkFaint">
                    Menampilkan{" "}
                    {(safePoinPage - 1) * ITEMS_PER_PAGE + 1}
                    {" - "}
                    {Math.min(
                      safePoinPage * ITEMS_PER_PAGE,
                      poin.length
                    )}
                    {" dari "}
                    {poin.length} riwayat
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      disabled={safePoinPage === 1}
                      onClick={() =>
                        setPoinPage((prev) =>
                          Math.max(prev - 1, 1)
                        )
                      }
                    >
                      Sebelumnya
                    </Button>

                    <span className="text-[13px] font-medium text-ink">
                      {safePoinPage} / {poinTotalPages}
                    </span>

                    <Button
                      variant="secondary"
                      disabled={safePoinPage === poinTotalPages}
                      onClick={() =>
                        setPoinPage((prev) =>
                          Math.min(prev + 1, poinTotalPages)
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
      </div>
    </div>
  );
}
