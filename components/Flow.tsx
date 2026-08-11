const steps = [
  { title: "Anggota mengajukan", desc: "Aspirasi atau masukan diajukan langsung dari aplikasi, kapan saja." },
  { title: "Perwakilan kelas meninjau", desc: "Aspirasi diverifikasi dan diteruskan ke divisi pengurus yang relevan." },
  { title: "Pengurus menindaklanjuti", desc: "Divisi terkait memperbarui status penanganan hingga tuntas." },
  { title: "Progres terpantau bersama", desc: "Seluruh anggota dapat melihat hasil akhir secara terbuka." },
];

export default function Flow() {
  return (
    <section id="alur" className="bg-bgAlt py-[88px]">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="mb-[52px] max-w-[600px]">
          <div className="mb-4 font-mono text-[12.5px] uppercase tracking-[0.14em] text-blue">Contoh Alur Kerja</div>
          <h2 className="mb-3.5 font-display text-[clamp(26px,3vw,36px)] font-bold tracking-tight text-navy">
            Bagaimana satu aspirasi berubah menjadi tindakan.
          </h2>
          <p className="text-[16px] text-inkSoft">
            Alur berjenjang memastikan setiap suara didengar dan setiap keputusan bisa dipertanggungjawabkan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-9 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              {i !== steps.length - 1 && (
                <span className="dashed-line absolute left-[calc(100%-12px)] top-[23px] hidden w-[calc(100%-20px)] md:block" />
              )}
              <div className="mb-[22px] flex h-[46px] w-[46px] items-center justify-center rounded-full bg-blue font-mono text-[13px] font-medium text-white">
                {i + 1}
              </div>
              <h4 className="mb-2 font-display text-[16px] font-bold text-navy">{s.title}</h4>
              <p className="text-[13.5px] text-inkSoft">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
