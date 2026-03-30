import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TECH_SESSION_COOKIE } from "@/lib/tech-auth";

export async function POST() {
  const jar = await cookies();
  jar.set(TECH_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}
