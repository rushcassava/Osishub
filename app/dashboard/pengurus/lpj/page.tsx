
import LpjModule from "@/components/modules/LpjModule";

export default function PengurusLpjPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">
        Pengajuan LPJ
      </h1>

      <p className="mb-8 text-[14.5px] text-inkSoft">
        Buat, kelola, dan ajukan laporan pertanggungjawaban kegiatan OSIS.
      </p>

      <LpjModule mode="list" />
    </div>
  );
}
