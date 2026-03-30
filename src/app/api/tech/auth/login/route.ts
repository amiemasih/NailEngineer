import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signTechSession, TECH_SESSION_COOKIE } from "@/lib/tech-auth";

export async function POST(req: Request) {
  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const expected =
    process.env.TECH_DASHBOARD_PASSWORD ??
    (process.env.NODE_ENV === "development" ? "nail-engineer-tech-dev-2026" : "");

  if (!expected) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
  }

  if (body.password !== expected) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const token = await signTechSession();
  const jar = await cookies();
  jar.set(TECH_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
