import { NextResponse } from "next/server";
import { ROUTES } from "@/constants/routes";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("userSession");
  const isPublicPath = pathname === ROUTES.core.home;

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL(ROUTES.customers.billing.pcdClosure.root, req.url));
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL(ROUTES.core.home, req.url));
  }

  return NextResponse.next();
}

// matcher must stay as static string literals -- Next.js statically analyzes
// this config at build time and cannot resolve imported/dynamic values here.
export const config = {
  matcher: [
    "/",
    "/customers/billing/account/",
    "/((?!_next|api|favicon.ico|static|public|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf|json)).*)",
  ],
};









