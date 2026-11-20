
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/DashboardShell";
import AIAssistant from "@/components/dashboard/AIAssistant";

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
    where: {
      peran: session.peran === "PEMBINA" ? "PENGURUS" : session.peran,
    },
    orderBy: {
      urutan: "asc",
    },
    select: {
      judul: true,
      deskripsi: true,
      status: true,
      slug: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <DashboardShell
        modules={modules}
        basePath={basePath}
        userName={session.nama}
        userRole={roleLabel[session.peran] ?? session.peran}
      >
        {children}
      </DashboardShell>

      {/* FLOATING AI ASSISTANT */}
      <AIAssistant />
    </div>
  );
}
