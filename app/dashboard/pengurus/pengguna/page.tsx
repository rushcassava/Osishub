import PenggunaModule from "@/components/modules/PenggunaModule";

export default function PengurusPenggunaPage() {
  return (
    <div>
      <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Manajemen Akun</h1>
      <p className="mb-8 text-[14.5px] text-inkSoft">
        Buat dan kelola akun anggota, perwakilan kelas, pengurus, dan pembina langsung dari dashboard.
      </p>
      <PenggunaModule />
    </div>
  );
}

