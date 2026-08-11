const divisions = [
  { name: "Divisi Acara & Event", amount: "Rp 4.850.000", pct: 78 },
  { name: "Divisi Humas & Publikasi", amount: "Rp 2.100.000", pct: 44 },
  { name: "Divisi Kerohanian", amount: "Rp 1.325.000", pct: 28 },
  { name: "Divisi Olahraga & Seni", amount: "Rp 3.400.000", pct: 61 },
];

export default function Transparency() {
  return (
    <section id="transparansi" className="py-[88px]">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.14em] text-blue">
              <span className="inline-block h-[1.5px] w-[22px] bg-blue" />
              Transparansi Dana
            </div>
            <h2 className="mb-4 font-display text-[clamp(24px,2.8vw,32px)] font-bold tracking-tight text-navy">
              Setiap rupiah punya catatan, setiap catatan bisa dilihat.
            </h2>
            <p className="mb-[22px] text-[15.5px] text-inkSoft">
              Kas masuk dan keluar per divisi ditampilkan secara langsung,
              sehingga anggota tidak perlu bertanya kemana dana organisasi
              digunakan.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Riwayat transaksi tersimpan otomatis",
                "Anggaran per divisi dapat dibandingkan dengan realisasi",
                "Laporan siap diunduh saat rapat pertanggungjawaban",
              ].map((t) => (
                <li key={t} className="relative pl-5 text-[14px] text-inkSoft">
                  <span className="absolute left-0 top-[6px] h-[7px] w-[7px] rounded-full bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[18px] bg-navy p-[26px] text-white shadow-card">
            <div className="mb-[22px] flex items-center justify-between">
              <span className="font-display text-[15px] font-bold">Ringkasan Kas — Semester Ganjil</span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/[0.08] px-[9px] py-1 font-mono text-[10.5px] text-[#9FD9A8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
                Live
              </span>
            </div>

            {divisions.map((d) => (
              <div key={d.name} className="mb-[18px]">
                <div className="mb-2 flex justify-between text-[13px] text-[#C7CEE0]">
                  <span>{d.name}</span>
                  <b className="font-mono font-medium text-white">{d.amount}</b>
                </div>
                <div className="h-[7px] overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-[#E8C471]"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="mt-6 flex justify-between border-t border-white/[0.12] pt-5">
              {[
                ["Rp 11,7 jt", "Total terealisasi"],
                ["96%", "Sesuai anggaran"],
                ["4", "Divisi aktif"],
              ].map(([num, lbl]) => (
                <div key={lbl}>
                  <div className="font-display text-[18px] font-bold">{num}</div>
                  <div className="mt-0.5 text-[11px] text-[#9AA4C0]">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
