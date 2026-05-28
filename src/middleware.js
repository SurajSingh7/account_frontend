import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("userSession");
  const isPublicPath = pathname === "/";

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/billing/account/pcd-closure", req.url));
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", 
    "/billing/account/",
    "/((?!_next|api|favicon.ico|static|public|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf|json)).*)",
  ],
};









