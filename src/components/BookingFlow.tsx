"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SERVICES } from "@/lib/services-catalog";

type Slot = {
  startAt: string;
  endAt: string;
  segmentState: "FREE" | "LIMITED";
};

function startOfWeekMonday(d: Date) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

const bookable = SERVICES.filter((s) => s.durationMins && s.durationMins > 0);

export function BookingFlow() {
  const [serviceId, setServiceId] = useState(bookable[0]?.id ?? "");
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ serviceName: string; startAt: string } | null>(null);

  const rangeStart = useMemo(
    () => addDays(startOfWeekMonday(new Date()), weekOffset * 7),
    [weekOffset],
  );
  const rangeEnd = useMemo(() => addDays(rangeStart, 7), [rangeStart]);

  const loadSlots = useCallback(async () => {
    if (!serviceId) return;
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const u = new URL("/api/booking/slots", window.location.origin);
      u.searchParams.set("serviceId", serviceId);
      u.searchParams.set("rangeStart", rangeStart.toISOString());
      u.searchParams.set("rangeEnd", rangeEnd.toISOString());
      const res = await fetch(u.toString());
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not load times.");
        setSlots([]);
        return;
      }
      setSlots(data.slots ?? []);
    } finally {
      setLoading(false);
    }
  }, [serviceId, rangeStart, rangeEnd]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          startAt: selected.startAt,
          endAt: selected.endAt,
          clientName: name.trim(),
          clientEmail: email.trim(),
          clientPhone: phone.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Booking failed.");
        return;
      }
      setDone({
        serviceName: data.booking?.serviceName ?? "",
        startAt: data.booking?.startAt ?? selected.startAt,
      });
      setSelected(null);
      setName("");
      setEmail("");
      setPhone("");
      await loadSlots();
    } finally {
      setSubmitting(false);
    }
  }

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const d = new Date(s.startAt).toDateString();
      const list = map.get(d) ?? [];
      list.push(s);
      map.set(d, list);
    }
    return map;
  }, [slots]);

  if (done) {
    return (
      <div className="rounded-2xl border border-cream-300 bg-cream-50 p-8 text-center space-y-3 shadow-sm">
        <p className="font-display text-xl font-bold text-ink">You are booked</p>
        <p className="text-mauve-600">
          {done.serviceName} ·{" "}
          {new Date(done.startAt).toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        <p className="text-sm text-mauve-600">
          Jayden will see this on his dashboard. Calendar sync runs when Google is connected.
        </p>
        <button
          type="button"
          onClick={() => setDone(null)}
          className="mt-4 text-sm font-semibold text-rose-800 hover:underline"
        >
          Book another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <label className="block text-sm font-semibold text-rose-900">Service</label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="mt-2 w-full max-w-lg rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm"
        >
          {bookable.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (~{s.durationMins} min)
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-mauve-600">
          Chair time comes from the service; final price for art may still follow the{" "}
          <Link href="/services" className="font-semibold text-rose-800 hover:underline">
            Services
          </Link>{" "}
          menu after consult.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w - 1)}
          className="rounded-full border border-cream-300 px-3 py-1.5 text-sm font-semibold text-rose-900 hover:bg-cream-50"
        >
          ← Prev week
        </button>
        <button
          type="button"
          onClick={() => setWeekOffset(0)}
          className="rounded-full border border-cream-300 px-3 py-1.5 text-sm font-semibold text-rose-900 hover:bg-cream-50"
        >
          This week
        </button>
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w + 1)}
          className="rounded-full border border-cream-300 px-3 py-1.5 text-sm font-semibold text-rose-900 hover:bg-cream-50"
        >
          Next week →
        </button>
      </div>

      <div className="rounded-xl border border-cream-200 bg-cream-50/80 px-4 py-3 text-sm text-mauve-700">
        <strong className="text-rose-900">How slots work:</strong>{" "}
        <span className="text-zinc-800 font-medium">Free</span> and{" "}
        <span className="text-zinc-600 font-medium">Only if necessary</span> windows are bookable.
        The system blocks times that would end too close to an{" "}
        <strong>Unavailable</strong> block (10-minute gap, or 30 minutes from &ldquo;only if
        necessary&rdquo;).
      </div>

      {loading ? (
        <p className="text-mauve-600">Loading open times…</p>
      ) : slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-300 bg-white p-8 text-mauve-600">
          No bookable slots this week for that service. Jayden may still be loading his biweekly
          availability—try another week or{" "}
          <Link href="/contact" className="font-semibold text-rose-800 hover:underline">
            contact
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-8">
          {[...slotsByDay.entries()].map(([day, daySlots]) => (
            <div key={day}>
              <h3 className="font-display text-lg font-bold text-rose-900">
                {new Date(daySlots[0].startAt).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {daySlots.map((s) => {
                  const active =
                    selected?.startAt === s.startAt && selected?.endAt === s.endAt;
                  return (
                    <button
                      key={s.startAt}
                      type="button"
                      onClick={() => setSelected(s)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? "border-rose-900 bg-rose-900 text-cream-50"
                          : s.segmentState === "LIMITED"
                            ? "border-zinc-400 bg-zinc-200 text-zinc-900 hover:border-zinc-500"
                            : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400"
                      }`}
                    >
                      {new Date(s.startAt).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {s.segmentState === "LIMITED" ? " · limited" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected ? (
        <form
          onSubmit={confirm}
          className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm space-y-4 max-w-lg"
        >
          <h3 className="font-display text-lg font-bold text-rose-900">Confirm</h3>
          <p className="text-sm text-mauve-600">
            {new Date(selected.startAt).toLocaleString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <div>
            <label className="block text-xs font-semibold text-mauve-600">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cream-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-mauve-600">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cream-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-mauve-600">Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cream-300 px-3 py-2 text-sm"
            />
          </div>
          {error ? <p className="text-sm text-zinc-800 font-medium">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-rose-900 py-3 text-sm font-semibold text-cream-50 hover:bg-rose-800 disabled:opacity-60"
          >
            {submitting ? "Reserving…" : "Reserve this time"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
