
"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import LogoutButton from "@/app/dashboard/logout-button";

type SidebarModule = {
  judul: string;
  deskripsi: string;
  status: "AKTIF" | "SEGERA_HADIR" | "MAINTENANCE";
  slug: string | null;
};

export default function DashboardShell({
  modules,
  basePath,
  userName,
  userRole,
  children,
}: {
  modules: SidebarModule[];
  basePath: string;
  userName: string;
  userRole: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <header className="sticky top-0 z-[60] border-b border-[#E8EAF0] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-7">

          <div className="flex items-center gap-3">
            {/* MOBILE SIDEBAR BUTTON */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka navigasi"
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-ink transition hover:bg-bgAlt lg:hidden"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* LOGO */}
            <a
              href="/"
              className="flex items-center gap-2.5 font-display text-[17px] font-bold text-navy transition-opacity hover:opacity-80"
            >
              <span className="relative flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-blueBright to-navy shadow-sm">
                <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white/80" />
              </span>
              OSIS-Hub
            </a>
          </div>

          {/* PROFILE + LOGOUT DESKTOP */}
          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-blueBright to-navy text-[11px] font-bold text-white shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </span>

              <div className="text-right">
                <div className="text-[13px] font-semibold text-ink">
                  {userName}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wide text-inkFaint">
                  {userRole}
                </div>
              </div>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* PROFILE MOBILE: TEPAT DI BAWAH NAVBAR */}
      <div className="border-b border-[#E8EAF0] bg-white lg:hidden">
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-5 py-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blueBright to-navy text-sm font-bold text-white shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </span>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-ink">
              {userName}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wide text-inkFaint">
              {userRole}
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-6 lg:min-h-[calc(100vh-72px)] lg:flex-row lg:gap-0 lg:px-0 lg:py-0">

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
        <main className="min-w-0 flex-1 px-0 py-0 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
