import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE, dashboardPathForRole } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isLoginPage = pathname === "/login";

  // Belum login tapi mencoba akses dashboard -> lempar ke /login
  if (isDashboard && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Sudah login tapi buka /login -> lempar ke dashboard sesuai peran
  if (isLoginPage && session) {
    const url = req.nextUrl.clone();
    url.pathname = dashboardPathForRole(session.peran);
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Sudah login tapi salah area dashboard -> lempar ke dashboard sesuai peran
  if (isDashboard && session && pathname !== "/dashboard/scan") {
    const correctPath = dashboardPathForRole(session.peran);
    if (pathname !== correctPath && !pathname.startsWith(correctPath + "/")) {
      const url = req.nextUrl.clone();
      url.pathname = correctPath;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
