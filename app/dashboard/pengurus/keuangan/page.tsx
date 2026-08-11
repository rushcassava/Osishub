import KeuanganModule from "@/components/modules/KeuanganModule";

export default function PengurusKeuanganPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Manajemen Keuangan</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Kelola pemasukan, pengeluaran, dan anggaran tiap divisi.
      </p>
      <KeuanganModule mode="pengurus" />
    </div>
  );
}

