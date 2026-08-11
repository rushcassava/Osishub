import EventModule from "@/components/modules/EventModule";

export default function PengurusEventPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Event &amp; Registrasi</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Buat event baru dan kelola pendaftaran peserta.
      </p>
      <EventModule mode="pengurus" />
    </div>
  );
}

