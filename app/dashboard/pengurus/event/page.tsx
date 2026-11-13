import EventModule from "@/components/modules/EventModule";

export default function PengurusEventPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Kegiatan &amp; Absensi</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Buat Kegiatan baru dan kelola Kehadiran Anggota OSIS dengan mudah melalui fitur ini.
      </p>
      <EventModule mode="pengurus" />
    </div>
  );
}

