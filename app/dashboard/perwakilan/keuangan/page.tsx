import KeuanganModule from "@/components/modules/KeuanganModule";

export default function PerwakilanKeuanganPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Transparansi Dana</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Lihat ringkasan kas masuk dan keluar tiap divisi.
      </p>
      <KeuanganModule mode="perwakilan" />
    </div>
  );
}

