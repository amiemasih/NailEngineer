"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TECH_SESSION_COOKIE } from "@/lib/tech-auth";
import { assertTechSession } from "@/lib/tech-session-server";
import {
  deleteBookingEvent,
  disconnect as disconnectGoogle,
} from "@/lib/google-calendar";

export async function cancelBooking(formData: FormData) {
  await assertTechSession();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { googleEventId: true, status: true },
  });

  const updated = await prisma.booking.updateMany({
    where: { id, status: "confirmed" },
    data: { status: "cancelled" },
  });

  // Remove the mirrored Google Calendar event, if one was pushed.
  if (updated.count > 0 && booking?.googleEventId) {
    await deleteBookingEvent(booking.googleEventId);
  }
  revalidatePath("/tech/dashboard");
}

export async function disconnectGoogleCalendar() {
  await assertTechSession();
  await disconnectGoogle();
  revalidatePath("/tech/dashboard");
}

export async function techLogout() {
  const jar = await cookies();
  jar.set(TECH_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  redirect("/tech/login");
}
