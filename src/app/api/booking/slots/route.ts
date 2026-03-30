import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeAvailableSlots } from "@/lib/booking-engine";
import { getServiceById } from "@/lib/services-catalog";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");
  const rangeStartRaw = searchParams.get("rangeStart");
  const rangeEndRaw = searchParams.get("rangeEnd");

  if (!serviceId || !rangeStartRaw || !rangeEndRaw) {
    return NextResponse.json({ error: "Missing serviceId, rangeStart, or rangeEnd." }, { status: 400 });
  }

  const service = getServiceById(serviceId);
  if (!service?.durationMins) {
    return NextResponse.json({ error: "Unknown or non-bookable service." }, { status: 400 });
  }

  const rangeStart = new Date(rangeStartRaw);
  const rangeEnd = new Date(rangeEndRaw);
  if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime()) || rangeEnd <= rangeStart) {
    return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
  }

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

  const slots = computeAvailableSlots(
    rangeStart,
    rangeEnd,
    blocks,
    bookings,
    service.durationMins,
    15,
  );

  return NextResponse.json({
    slots: slots.map((s) => ({
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
      segmentState: s.segmentState,
    })),
  });
}
