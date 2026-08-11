import { redirect } from "next/navigation";
import { getSession, dashboardPathForRole } from "@/lib/auth";

export default async function DashboardIndex() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(dashboardPathForRole(session.peran));
}
