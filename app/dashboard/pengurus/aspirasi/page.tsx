import AspirasiModule from "@/components/modules/AspirasiModule";

export default function PengurusAspirasiPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Aspirasi Masuk</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Tindak lanjuti aspirasi yang diteruskan oleh perwakilan kelas.
      </p>
      <AspirasiModule mode="pengurus" />
    </div>
  );
}

