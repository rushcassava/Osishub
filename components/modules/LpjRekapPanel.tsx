
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Card } from "@/components/dashboard/ui";

type LpjRekapPanelProps = {
  onClose: () => void;
};

export default function LpjRekapPanel({
  onClose,
}: LpjRekapPanelProps) {
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const defaultTahun =
    new Date().getMonth() >= 6
      ? currentYear
      : currentYear - 1;

  const [tahun, setTahun] = useState(
    defaultTahun.toString()
  );

  const tahunOptions = Array.from(
    { length: 6 },
    (_, i) => {
      const year = currentYear - 4 + i;

      return {
        value: year.toString(),
        label: `${year}/${year + 1}`,
      };
    }
  );

  function handleTampilkan() {
    router.push(
      `/dashboard/pengurus/lpj/rekap/${tahun}`
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-md">
        <Card className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-navy">
                Rekapitulasi LPJ
              </h2>

              <p className="mt-1 text-sm text-inkSoft">
                Pilih tahun ajaran untuk melihat rekapitulasi LPJ.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label="Tutup popup"
            >
              ✕
            </button>
          </div>

          <div>
            <label
              htmlFor="tahun-rekap"
              className="mb-2 block text-sm font-medium text-ink"
            >
              Tahun Ajaran
            </label>

            <select
              id="tahun-rekap"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full rounded-[9px] border border-[#E8EAF0] bg-[#F8F9FC] px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-blueBright focus:bg-white"
            >
              {tahunOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleTampilkan}
            >
              Tampilkan Rekapitulasi
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
