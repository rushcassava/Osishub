import ProkerModule from "@/components/modules/ProkerModule";

export default function PerwakilanAgendaPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Agenda &amp; Proker</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Pantau linimasa program kerja yang sedang berjalan.
      </p>
      <ProkerModule mode="perwakilan" />
    </div>
  );
}

