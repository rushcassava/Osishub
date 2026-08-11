import AspirasiModule from "@/components/modules/AspirasiModule";

export default function PerwakilanAspirasiPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Aspirasi &amp; Masukan</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Ajukan aspirasi dan pantau status tindak lanjutnya.
      </p>
      <AspirasiModule mode="submit" />
    </div>
  );
}

