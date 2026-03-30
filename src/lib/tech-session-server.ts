import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { TECH_SESSION_COOKIE, techSecretKey } from "@/lib/tech-auth";

export async function assertTechSession() {
  const jar = await cookies();
  const token = jar.get(TECH_SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/tech/login");
  }
  try {
    await jwtVerify(token, techSecretKey());
  } catch {
    redirect("/tech/login");
  }
}
