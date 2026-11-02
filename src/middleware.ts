import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwtHs256 } from "@/lib/jwt-edge";

const COOKIE = "nailcraft_session";
const TECH_COOKIE = "ne_tech_session";

function secret() {
  const s =
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "dev-nailcraft-secret-min-16-chars"
      : undefined);
  if (!s || s.length < 16) return null;
  return new TextEncoder().encode(s);
}

function techSecret() {
  const s =
    process.env.TECH_DASHBOARD_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "dev-tech-dashboard-secret-min-16-chars"
      : undefined);
  if (!s || s.length < 16) return null;
  return new TextEncoder().encode(s);
}

function isTechLoginPath(pathname: string) {
  return pathname === "/tech/login" || pathname.startsWith("/tech/login/");
}

function isPublicTechApi(pathname: string) {
  return (
    pathname === "/api/tech/auth/login" ||
    pathname === "/api/tech/auth/logout"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/tech/")) {
    if (isPublicTechApi(pathname)) {
      return NextResponse.next();
    }
    const token = request.cookies.get(TECH_COOKIE)?.value;
    const key = techSecret();
    if (!token || !key) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      await verifyJwtHs256(token, key);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname === "/tech" || pathname.startsWith("/tech/")) {
    if (isTechLoginPath(pathname)) {
      return NextResponse.next();
    }
    const token = request.cookies.get(TECH_COOKIE)?.value;
    const key = techSecret();
    if (!token || !key) {
      return NextResponse.redirect(new URL("/tech/login", request.url));
    }
    try {
      await verifyJwtHs256(token, key);
    } catch {
      return NextResponse.redirect(new URL("/tech/login", request.url));
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/learn")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  const key = secret();
  if (!token || !key) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    await verifyJwtHs256(token, key);
  } catch {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/tech",
    "/tech/:path*",
    "/api/tech/:path*",
  ],
};
