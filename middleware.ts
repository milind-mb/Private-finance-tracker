import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.SITE_PASSWORD;
const COOKIE = "ft_auth";

export function middleware(req: NextRequest) {
  // No password configured → open (shouldn't happen in prod)
  if (!PASSWORD) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Allow the login page and its POST through
  if (pathname === "/login") return NextResponse.next();

  // Check auth cookie
  const cookie = req.cookies.get(COOKIE);
  if (cookie?.value === PASSWORD) return NextResponse.next();

  // Redirect to login, remembering where they were going
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
