"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TECH_SESSION_COOKIE } from "@/lib/tech-auth";
import { assertTechSession } from "@/lib/tech-session-server";

export async function cancelBooking(formData: FormData) {
  await assertTechSession();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await prisma.booking.updateMany({
    where: { id, status: "confirmed" },
    data: { status: "cancelled" },
  });
  revalidatePath("/tech/dashboard");
}

export async function techLogout() {
  const jar = await cookies();
  jar.set(TECH_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  redirect("/tech/login");
}
