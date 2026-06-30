import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/apps", "/accounts", "/groups", "/customers", "/accounting", "/settings"];

export function middleware(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  const hasMockSession = request.cookies.get("sg_admin_mock")?.value === "active";

  if (isProtected && !hasMockSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname === "/" && hasMockSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
