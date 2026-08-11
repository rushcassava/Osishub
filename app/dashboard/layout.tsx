import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";
import Sidebar from "@/components/dashboard/Sidebar";

const roleLabel: Record<string, string> = {
  ANGGOTA: "Anggota OSIS",
  PERWAKILAN_KELAS: "Perwakilan Kelas",
  PENGURUS: "Pengurus",
  PEMBINA: "Pembina",
};

const roleBasePath: Record<string, string> = {
  ANGGOTA: "/dashboard/anggota",
  PERWAKILAN_KELAS: "/dashboard/perwakilan",
  PENGURUS: "/dashboard/pengurus",
  PEMBINA: "/dashboard/pengurus",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const basePath = roleBasePath[session.peran] ?? "/dashboard";

  const modules = await prisma.module.findMany({
    where: { peran: session.peran === "PEMBINA" ? "PENGURUS" : session.peran },
    orderBy: { urutan: "asc" },
    select: { judul: true, deskripsi: true, status: true, slug: true },
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <header className="border-b border-[#E8EAF0] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-3.5 lg:px-7">
          <a href="/" className="flex items-center gap-2.5 font-display text-[17px] font-bold text-navy transition-opacity hover:opacity-80">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-blueBright to-navy shadow-sm">
              <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white/80" />
            </span>
            OSIS-Hub
          </a>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-gradient-to-br from-blueBright to-navy text-[11px] font-bold text-white shadow-sm">
                {session.nama.charAt(0).toUpperCase()}
              </span>
              <div className="text-right">
                <div className="text-[13px] font-semibold text-ink">{session.nama}</div>
                <div className="font-mono text-[10px] uppercase tracking-wide text-inkFaint">
                  {roleLabel[session.peran] ?? session.peran}
                </div>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-8 lg:min-h-[calc(100vh-69px)] lg:flex-row lg:gap-0 lg:px-0 lg:py-0">
        <div className="w-full shrink-0 lg:w-[260px]">
          <Sidebar modules={modules} basePath={basePath} />
        </div>
        <main className="min-w-0 flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
