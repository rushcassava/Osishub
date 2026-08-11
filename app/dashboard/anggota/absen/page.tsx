import AbsenModule from "@/components/modules/AbsenModule";

export default function AnggotaAbsenPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Absen &amp; Poin Keaktifan</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Lihat riwayat kehadiran dan poin keaktifanmu.
      </p>
      <AbsenModule />
    </div>
  );
}

