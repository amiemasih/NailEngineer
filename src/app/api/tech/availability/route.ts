import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AvailabilityState } from "@prisma/client";

const STATES: AvailabilityState[] = ["FREE", "LIMITED", "UNAVAILABLE"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startRaw = searchParams.get("rangeStart");
  const endRaw = searchParams.get("rangeEnd");

  const rangeStart = startRaw ? new Date(startRaw) : new Date();
  const rangeEnd = endRaw
    ? new Date(endRaw)
    : new Date(rangeStart.getTime() + 21 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
    return NextResponse.json({ error: "Invalid range." }, { status: 400 });
  }

  const blocks = await prisma.availabilityBlock.findMany({
    where: { endAt: { gt: rangeStart }, startAt: { lt: rangeEnd } },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({
    blocks: blocks.map((b) => ({
      id: b.id,
      startAt: b.startAt.toISOString(),
      endAt: b.endAt.toISOString(),
      state: b.state,
      note: b.note,
    })),
  });
}

export async function POST(req: Request) {
  let body: {
    startAt?: string;
    endAt?: string;
    state?: AvailabilityState;
    note?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { startAt: s, endAt: e, state, note } = body;
  if (!s || !e || !state) {
    return NextResponse.json({ error: "startAt, endAt, and state are required." }, { status: 400 });
  }

  if (!STATES.includes(state)) {
    return NextResponse.json({ error: "Invalid state." }, { status: 400 });
  }

  const startAt = new Date(s);
  const endAt = new Date(e);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
    return NextResponse.json({ error: "Invalid window." }, { status: 400 });
  }

  const block = await prisma.availabilityBlock.create({
    data: {
      startAt,
      endAt,
      state,
      note: note?.trim() || null,
    },
  });

  return NextResponse.json({
    block: {
      id: block.id,
      startAt: block.startAt.toISOString(),
      endAt: block.endAt.toISOString(),
      state: block.state,
      note: block.note,
    },
  });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  await prisma.availabilityBlock.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
