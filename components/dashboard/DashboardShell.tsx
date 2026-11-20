
"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";

type SidebarModule = {
  judul: string;
  deskripsi: string;
  status: "AKTIF" | "SEGERA_HADIR" | "MAINTENANCE";
  slug: string | null;
};

export default function DashboardShell({
  modules,
  basePath,
  children,
}: {
  modules: SidebarModule[];
  basePath: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-8 lg:min-h-[calc(100vh-69px)] lg:flex-row lg:gap-0 lg:px-0 lg:py-0">
      {/* SIDEBAR */}
      <div
        className={`w-0 shrink-0 overflow-visible transition-[width] duration-300 ease-in-out lg:w-[260px] ${
  collapsed ? "lg:w-[76px]" : "lg:w-[260px]"
}`}
      >
        <Sidebar
          modules={modules}
          basePath={basePath}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggle={() => setCollapsed((value) => !value)}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 px-5 py-6 lg:px-8 lg:py-8">
        {/* MOBILE MENU BUTTON */}
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka navigasi"
            aria-expanded={mobileOpen}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#E8EAF0] bg-white px-3 text-sm font-medium text-ink shadow-sm transition hover:bg-bgAlt"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menu
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
