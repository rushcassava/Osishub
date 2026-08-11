import EventModule from "@/components/modules/EventModule";

export default function AnggotaEventPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Event &amp; Registrasi</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Daftar event OSIS dan lakukan check-in QR.
      </p>
      <EventModule mode="anggota" />
    </div>
  );
}

