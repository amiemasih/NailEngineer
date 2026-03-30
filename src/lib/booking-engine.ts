import type { AvailabilityState } from "@prisma/client";

export type BlockLike = {
  startAt: Date;
  endAt: Date;
  state: AvailabilityState;
};

export type BookingLike = {
  startAt: Date;
  endAt: Date;
};

const MIN_BEFORE_UNAVAILABLE_FREE_MS = 10 * 60 * 1000;
const MIN_BEFORE_UNAVAILABLE_LIMITED_MS = 30 * 60 * 1000;

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aEnd > bStart && aStart < bEnd;
}

/**
 * FREE: booking must end ≥10 min before any unavailable start it approaches.
 * LIMITED: booking must end ≥30 min before any unavailable start it approaches.
 * No overlap with any UNAVAILABLE window.
 */
export function slotViolatesRules(
  startMs: number,
  endMs: number,
  segmentState: "FREE" | "LIMITED",
  unavailable: { startMs: number; endMs: number }[],
): boolean {
  const buffer =
    segmentState === "LIMITED"
      ? MIN_BEFORE_UNAVAILABLE_LIMITED_MS
      : MIN_BEFORE_UNAVAILABLE_FREE_MS;

  for (const u of unavailable) {
    if (overlaps(startMs, endMs, u.startMs, u.endMs)) return true;
    if (startMs < u.startMs && endMs > u.startMs - buffer) return true;
  }
  return false;
}

function toUnavailableIntervals(blocks: BlockLike[]): { startMs: number; endMs: number }[] {
  return blocks
    .filter((b) => b.state === "UNAVAILABLE")
    .map((b) => ({ startMs: b.startAt.getTime(), endMs: b.endAt.getTime() }))
    .sort((a, b) => a.startMs - b.startMs);
}

function bookingOverlaps(a: BookingLike, startMs: number, endMs: number): boolean {
  return overlaps(startMs, endMs, a.startAt.getTime(), a.endAt.getTime());
}

export type AvailableSlot = {
  startAt: Date;
  endAt: Date;
  segmentState: "FREE" | "LIMITED";
};

/**
 * Generate bookable slots inside FREE/LIMITED blocks only, honoring buffers and existing bookings.
 */
export function computeAvailableSlots(
  windowStart: Date,
  windowEnd: Date,
  blocks: BlockLike[],
  bookings: BookingLike[],
  serviceDurationMins: number,
  slotStepMins: number,
): AvailableSlot[] {
  const winS = windowStart.getTime();
  const winE = windowEnd.getTime();
  const durationMs = serviceDurationMins * 60 * 1000;
  const stepMs = slotStepMins * 60 * 1000;
  const unavailable = toUnavailableIntervals(blocks);
  const activeBookings = bookings.filter((b) => b.endAt.getTime() > winS && b.startAt.getTime() < winE);

  const sortedBlocks = [...blocks].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const out: AvailableSlot[] = [];

  for (const block of sortedBlocks) {
    if (block.state === "UNAVAILABLE") continue;
    const segState = block.state === "LIMITED" ? "LIMITED" : "FREE";
    const bStart = Math.max(block.startAt.getTime(), winS);
    const bEnd = Math.min(block.endAt.getTime(), winE);
    if (bEnd - bStart < durationMs) continue;

    for (let t = bStart; t + durationMs <= bEnd; t += stepMs) {
      const end = t + durationMs;
      if (slotViolatesRules(t, end, segState, unavailable)) continue;
      const clash = activeBookings.some((bk) => bookingOverlaps(bk, t, end));
      if (clash) continue;
      out.push({
        startAt: new Date(t),
        endAt: new Date(end),
        segmentState: segState,
      });
    }
  }

  return out.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}
