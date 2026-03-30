import { SignJWT } from "jose";

const COOKIE = "ne_tech_session";

export { COOKIE as TECH_SESSION_COOKIE };

export function techSecretKey(): Uint8Array {
  const s =
    process.env.TECH_DASHBOARD_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "dev-tech-dashboard-secret-min-16-chars"
      : undefined);
  if (!s || s.length < 16) {
    throw new Error("TECH_DASHBOARD_SECRET must be set (min 16 characters)");
  }
  return new TextEncoder().encode(s);
}

export async function signTechSession(): Promise<string> {
  return new SignJWT({ role: "tech" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("tech")
    .setExpirationTime("7d")
    .sign(techSecretKey());
}
