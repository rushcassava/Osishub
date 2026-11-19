
import LpjRekapResult from "@/components/modules/LpjRekapResult";

type PageProps = {
  params: Promise<{
    tahun: string;
  }>;
};

export default async function LpjRekapPage({
  params,
}: PageProps) {
  const { tahun } = await params;

  return (
    <div>
      <div className="mb-6">
        <a
          href="/dashboard/pengurus/lpj"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-inkSoft transition hover:text-navy"
        >
          ← Kembali ke Pengajuan LPJ
        </a>

        <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">
          Rekapitulasi LPJ
        </h1>

        <p className="text-[14.5px] text-inkSoft">
          Laporan pertanggungjawaban OSIS tahun ajaran{" "}
          {tahun}/{Number(tahun) + 1}.
        </p>
      </div>

      <LpjRekapResult tahun={tahun} />
    </div>
  );
}
