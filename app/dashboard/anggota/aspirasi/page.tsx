import AspirasiModule from "@/components/modules/AspirasiModule";

export default function AnggotaAspirasiPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Tinjau Aspirasi Kelas</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Verifikasi dan teruskan aspirasi dari kelasmu ke divisi terkait.
      </p>
      <AspirasiModule mode="review" />
    </div>
  );
}

