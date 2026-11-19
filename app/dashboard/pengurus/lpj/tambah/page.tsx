import LpjModule from "@/components/modules/LpjModule";

export default function TambahLpjPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">
        Ajukan LPJ
      </h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Lengkapi laporan pertanggungjawaban kegiatan OSIS.
      </p>

      <LpjModule mode="form" />
    </div>
  );
}
