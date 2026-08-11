import Link from "next/link";

type ModuleStatus = "AKTIF" | "SEGERA_HADIR" | "MAINTENANCE";

const statusConfig: Record<ModuleStatus, { label: string; className: string }> = {
  AKTIF: {
    label: "Aktif",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  SEGERA_HADIR: {
    label: "Segera hadir",
    className: "bg-blueSoft text-blue",
  },
  MAINTENANCE: {
    label: "Pemeliharaan",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export default function ModuleCard({
  title,
  desc,
  status = "SEGERA_HADIR",
  href,
}: {
  title: string;
  desc: string;
  status?: ModuleStatus;
  href?: string;
}) {
  const config = statusConfig[status];
  const isActive = status === "AKTIF" && href;

  const inner = (
    <>
      <div className={`mb-3 inline-block rounded-md px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] ${config.className}`}>
        {config.label}
      </div>
      <h3 className="mb-1.5 font-display text-[16px] font-bold text-navy">{title}</h3>
      <p className="text-[13.5px] text-inkSoft">{desc}</p>
      {isActive && (
        <div className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue">
          Buka modul
          <span aria-hidden>→</span>
        </div>
      )}
    </>
  );

  const classBase =
    "block rounded-[14px] border p-6 transition";
  const classActive =
    "border-line bg-panel hover:border-blue/40 hover:bg-white hover:shadow-card";
  const classInactive =
    "border-dashed border-line bg-panel";

  if (isActive) {
    return (
      <Link href={href} className={`${classBase} ${classActive}`}>
        {inner}
      </Link>
    );
  }

  return <div className={`${classBase} ${classInactive}`}>{inner}</div>;
}

