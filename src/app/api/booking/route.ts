import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeAvailableSlots, slotViolatesRules } from "@/lib/booking-engine";
import { getServiceById } from "@/lib/services-catalog";
import { syncBookingToGoogleIfConfigured } from "@/lib/google-calendar";

type Body = {
  serviceId?: string;
  startAt?: string;
  endAt?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const {
    serviceId,
    startAt: startRaw,
    endAt: endRaw,
    clientName,
    clientEmail,
    clientPhone,
  } = body;

  if (!serviceId || !startRaw || !endRaw || !clientName?.trim() || !clientEmail?.trim()) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const service = getServiceById(serviceId);
  if (!service?.durationMins) {
    return NextResponse.json({ error: "Invalid service." }, { status: 400 });
  }

  const startAt = new Date(startRaw);
  const endAt = new Date(endRaw);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return NextResponse.json({ error: "Invalid times." }, { status: 400 });
  }

  const expectedMs = service.durationMins * 60 * 1000;
  if (Math.abs(endAt.getTime() - startAt.getTime() - expectedMs) > 60 * 1000) {
    return NextResponse.json({ error: "Slot length does not match service duration." }, { status: 400 });
  }

  const padMs = 6 * 60 * 60 * 1000;
  const rangeStart = new Date(startAt.getTime() - padMs);
  const rangeEnd = new Date(endAt.getTime() + padMs);

  const [blocks, bookings] = await Promise.all([
    prisma.availabilityBlock.findMany({
      where: { endAt: { gt: rangeStart }, startAt: { lt: rangeEnd } },
      orderBy: { startAt: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        status: "confirmed",
        endAt: { gt: rangeStart },
        startAt: { lt: rangeEnd },
      },
    }),
  ]);

  const startMs = startAt.getTime();
  const endMs = endAt.getTime();

  const containing = blocks.find(
    (b) =>
      b.state !== "UNAVAILABLE" &&
      b.startAt.getTime() <= startMs &&
      b.endAt.getTime() >= endMs,
  );

  if (!containing) {
    return NextResponse.json(
      { error: "That time is not inside an open availability window." },
      { status: 409 },
    );
  }

  const segmentState = containing.state === "LIMITED" ? "LIMITED" : "FREE";
  const unavailable = blocks
    .filter((b) => b.state === "UNAVAILABLE")
    .map((b) => ({ startMs: b.startAt.getTime(), endMs: b.endAt.getTime() }));

  if (slotViolatesRules(startMs, endMs, segmentState, unavailable)) {
    return NextResponse.json(
      { error: "That slot violates buffer rules before unavailable time." },
      { status: 409 },
    );
  }

  const overlap = bookings.some(
    (b) => b.endAt.getTime() > startMs && b.startAt.getTime() < endMs,
  );
  if (overlap) {
    return NextResponse.json({ error: "That slot was just taken. Pick another time." }, { status: 409 });
  }

  const stillValid = computeAvailableSlots(
    rangeStart,
    rangeEnd,
    blocks,
    bookings,
    service.durationMins,
    15,
  ).some((s) => s.startAt.getTime() === startMs && s.endAt.getTime() === endMs);

  if (!stillValid) {
    return NextResponse.json({ error: "Slot no longer available." }, { status: 409 });
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        startAt,
        endAt,
        serviceId,
        serviceName: service.name,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim().toLowerCase(),
        clientPhone: clientPhone?.trim() || null,
        status: "confirmed",
      },
    });

    void syncBookingToGoogleIfConfigured({
      id: booking.id,
      startAt: booking.startAt,
      endAt: booking.endAt,
      serviceName: booking.serviceName,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
    });

    return NextResponse.json({
      ok: true,
      booking: {
        id: booking.id,
        startAt: booking.startAt.toISOString(),
        endAt: booking.endAt.toISOString(),
        serviceName: booking.serviceName,
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not complete booking." }, { status: 500 });
  }
}
