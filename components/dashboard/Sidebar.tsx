"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ModuleStatus = "AKTIF" | "SEGERA_HADIR" | "MAINTENANCE";

type SidebarModule = {
  judul: string;
  deskripsi: string;
  status: ModuleStatus;
  slug: string | null;
};

/* ─── Ikon SVG ─────────────────────────────────────────── */

function HomeIcon() {
  return (
    <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

const iconBySlug: Record<string, { icon: React.ReactNode; tile: string; activeTile: string }> = {
  aspirasi: {
    icon: <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    tile: "bg-blueSoft text-blue",
    activeTile: "bg-white/20 text-white",
  },
  event: {
    icon: <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    tile: "bg-emerald-50 text-emerald-600",
    activeTile: "bg-white/20 text-white",
  },
  absen: {
    icon: <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    tile: "bg-green-50 text-green-600",
    activeTile: "bg-white/20 text-white",
  },
  agenda: {
    icon: <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M9 12h6M9 16h6" /></svg>,
    tile: "bg-goldSoft text-gold",
    activeTile: "bg-white/20 text-white",
  },
  keuangan: {
    icon: <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></svg>,
    tile: "bg-emerald-50 text-emerald-600",
    activeTile: "bg-white/20 text-white",
  },
  arsip: {
    icon: <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
    tile: "bg-indigo-50 text-indigo-600",
    activeTile: "bg-white/20 text-white",
  },
  lpj: {
    icon: <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    tile: "bg-purple-50 text-purple-600",
    activeTile: "bg-white/20 text-white",
  },
  "lpj-rekap": {
    icon: <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><polyline points="8 13 10 15 12 13" /><line x1="10" y1="15" x2="10" y2="9" /></svg>,
    tile: "bg-violet-50 text-violet-600",
    activeTile: "bg-white/20 text-white",
  },
  pengguna: {
    icon: <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    tile: "bg-rose-50 text-rose-600",
    activeTile: "bg-white/20 text-white",
  },
};

const statusDotClass: Record<ModuleStatus, string> = {
  AKTIF: "bg-emerald-400",
  SEGERA_HADIR: "bg-amber-400",
  MAINTENANCE: "bg-red-400",
};

const statusLabel: Record<ModuleStatus, string> = {
  AKTIF: "Aktif",
  SEGERA_HADIR: "Segera hadir",
  MAINTENANCE: "Pemeliharaan",
};

function NavLink({
  href,
  active,
  slug,
  label,
  status,
}: {
  href: string;
  active: boolean;
  slug: string;
  label: string;
  status?: ModuleStatus;
}) {
  const cfg = iconBySlug[slug] ?? {
    icon: <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /></svg>,
    tile: "bg-bgAlt text-inkSoft",
    activeTile: "bg-white/20 text-white",
  };

  return (
    <Link
      href={href}
      title={label}
      className={`group relative flex items-center gap-3 rounded-[11px] px-2.5 py-2 text-[13px] font-medium transition-all ${
        active
          ? "bg-gradient-to-r from-navyAlt to-navy text-white shadow-card"
          : "text-inkSoft hover:bg-white hover:text-ink hover:shadow-sm"
      }`}
    >
      {active && (
        <span className="absolute -left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blueBright" />
      )}
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] transition-all ${active ? cfg.activeTile : cfg.tile}`}>
        {cfg.icon}
      </span>
      <span className="flex-1 leading-snug">{label}</span>
      {status && (
        <span className="relative flex h-2 w-2">
          {status === "AKTIF" && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${statusDotClass[status]}`} />
        </span>
      )}
      {active && <span className="sr-only">{statusLabel[status ?? "AKTIF"]}</span>}
    </Link>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition ${
        active
          ? "border-navy bg-navy text-white shadow-sm"
          : "border-line bg-white text-inkSoft hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Sidebar({
  modules,
  basePath,
}: {
  modules: SidebarModule[];
  basePath: string;
}) {
  const pathname = usePathname();

  const links = modules
    .filter((m) => m.slug)
    .map((m) => ({
      href: `${basePath}/${m.slug}`,
      label: m.judul,
      slug: m.slug!,
      status: m.status,
      active: pathname === `${basePath}/${m.slug}`,
    }));

  const homeActive = pathname === basePath;

  return (
    <>
      {/* Navigasi mobile — chip horizontal */}
      <nav className="-mx-1 overflow-x-auto pb-1 lg:hidden">
        <div className="flex gap-2 whitespace-nowrap">
          <Chip href={basePath} active={homeActive}>
            <HomeIcon /> Beranda
          </Chip>
          {links.map((l) => (
            <Chip key={l.href} href={l.href} active={l.active}>
              <span className="text-inkSoft">{l.label}</span>
            </Chip>
          ))}
        </div>
      </nav>

      {/* Sidebar desktop */}
      <aside className="hidden lg:block lg:h-screen lg:sticky lg:top-0">
        <div className="flex h-full flex-col overflow-y-auto border-r border-[#E8EAF0] bg-white/80 px-4 py-6 backdrop-blur-md">

          <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.1em] text-inkFaint">
            Navigasi
          </div>
          <div className="flex flex-col gap-0.5">
            <NavLink href={basePath} active={homeActive} slug="home" label="Beranda" />
          </div>

          <div className="my-3 h-px bg-gradient-to-r from-line to-transparent" />

          <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.1em] text-inkFaint">
            Modul {links.length > 0 && `(${links.length})`}
          </div>
          <div className="flex flex-col gap-0.5">
            {links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                active={l.active}
                slug={l.slug}
                label={l.label}
                status={l.status}
              />
            ))}
          </div>

          {/* Menu khusus Pengurus: Rekap LPJ Tahunan — selalu tampil */}
          {basePath.includes("pengurus") && (
            <>
              <div className="my-3 h-px bg-gradient-to-r from-line to-transparent" />
              <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.1em] text-inkFaint">
                Laporan
              </div>
              <div className="flex flex-col gap-0.5">
                <NavLink
                  href={`${basePath}/lpj-rekap`}
                  active={pathname === `${basePath}/lpj-rekap`}
                  slug="lpj-rekap"
                  label="Rekap LPJ Tahunan"
                />
              </div>
            </>
          )}

          <div className="mt-auto pt-6">
            <div className="rounded-[12px] border border-[#E8EAF0] bg-gradient-to-br from-bgAlt/60 to-white px-4 py-4 text-[12px] text-inkFaint">
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-navy">
                <svg className="h-3.5 w-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Pusat kendali
              </div>
              <div className="leading-snug">Organisasi siswa modern dalam satu platform.</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
