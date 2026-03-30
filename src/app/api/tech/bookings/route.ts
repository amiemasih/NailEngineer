import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fromRaw = searchParams.get("from");
  const from = fromRaw ? new Date(fromRaw) : new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      status: "confirmed",
      endAt: { gte: from },
    },
    orderBy: { startAt: "asc" },
    take: 200,
  });

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      startAt: b.startAt.toISOString(),
      endAt: b.endAt.toISOString(),
      serviceId: b.serviceId,
      serviceName: b.serviceName,
      clientName: b.clientName,
      clientEmail: b.clientEmail,
      clientPhone: b.clientPhone,
      status: b.status,
      notes: b.notes,
    })),
  });
}

export async function PATCH(req: Request) {
  let body: { id?: string; status?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status required." }, { status: 400 });
  }

  if (!["confirmed", "cancelled"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const result = await prisma.booking.updateMany({
    where: { id: body.id },
    data: { status: body.status },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json({
    booking: {
      id: body.id,
      status: body.status,
    },
  });
}
