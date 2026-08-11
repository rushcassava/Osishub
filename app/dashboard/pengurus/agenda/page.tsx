import ProkerModule from "@/components/modules/ProkerModule";

export default function PengurusAgendaPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Agenda &amp; Proker</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Susun dan perbarui program kerja tiap divisi.
      </p>
      <ProkerModule mode="pengurus" />
    </div>
  );
}

