"use client";

import { useCallback, useEffect, useState } from "react";

type Block = {
  id: string;
  startAt: string;
  endAt: string;
  state: "FREE" | "LIMITED" | "UNAVAILABLE";
  note: string | null;
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

const stateStyles: Record<Block["state"], string> = {
  FREE: "bg-white border-zinc-300 text-zinc-900",
  LIMITED: "bg-zinc-200 border-zinc-400 text-zinc-900",
  UNAVAILABLE: "bg-zinc-500 border-zinc-600 text-cream-50",
};

export function TechAvailabilityEditor() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [state, setState] = useState<Block["state"]>("FREE");
  const [note, setNote] = useState("");

  const rangeStart = addDays(startOfWeekMonday(new Date()), weekOffset * 7);
  const rangeEnd = addDays(rangeStart, 7);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = new URL("/api/tech/availability", window.location.origin);
      u.searchParams.set("rangeStart", rangeStart.toISOString());
      u.searchParams.set("rangeEnd", rangeEnd.toISOString());
      const res = await fetch(u.toString(), { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not load availability.");
        return;
      }
      setBlocks(data.blocks ?? []);
    } finally {
      setLoading(false);
    }
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addBlock(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const startAt = new Date(startLocal);
      const endAt = new Date(endLocal);
      if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
        setError("Start must be before end.");
        return;
      }
      const res = await fetch("/api/tech/availability", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          state,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Save failed.");
        return;
      }
      setStartLocal("");
      setEndLocal("");
      setNote("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function removeBlock(id: string) {
    await fetch(`/api/tech/availability?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    await load();
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
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
        <p className="text-sm text-mauve-600">
          {rangeStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} –{" "}
          {addDays(rangeEnd, -1).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-rose-900">Legend</h2>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
          <li className={`rounded-full px-3 py-1 border ${stateStyles.FREE}`}>Free</li>
          <li className={`rounded-full px-3 py-1 border ${stateStyles.LIMITED}`}>
            Only if necessary
          </li>
          <li className={`rounded-full px-3 py-1 border ${stateStyles.UNAVAILABLE}`}>Unavailable</li>
        </ul>
        <p className="mt-3 text-xs text-mauve-600 leading-relaxed max-w-2xl">
          Block <strong>unavailable</strong> from the time you need travel or wind-down—not from the
          exact start of your next class. Clients can only book <strong>Free</strong> or{" "}
          <strong>Only if necessary</strong>; limited windows enforce a 30-minute buffer before the
          next unavailable block on the public booker.
        </p>
      </div>

      <form onSubmit={addBlock} className="rounded-2xl border border-cream-200 bg-cream-50/50 p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-rose-900">Quick add block</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-mauve-600">
              Start (local)
            </label>
            <input
              type="datetime-local"
              required
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-mauve-600">
              End (local)
            </label>
            <input
              type="datetime-local"
              required
              value={endLocal}
              onChange={(e) => setEndLocal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-mauve-600">
            State
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value as Block["state"])}
            className="mt-1 w-full max-w-md rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm"
          >
            <option value="FREE">Free — open booking</option>
            <option value="LIMITED">Only if necessary — tighter buffers</option>
            <option value="UNAVAILABLE">Unavailable — no booking</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-mauve-600">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. NU class block · travel buffer"
            className="mt-1 w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm"
          />
        </div>
        {error ? <p className="text-sm text-zinc-800 font-medium">{error}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-rose-900 px-6 py-2.5 text-sm font-semibold text-cream-50 hover:bg-rose-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add to calendar"}
        </button>
      </form>

      <section>
        <h2 className="font-display text-lg font-bold text-rose-900">This window</h2>
        {loading ? (
          <p className="mt-4 text-mauve-600">Loading…</p>
        ) : blocks.length === 0 ? (
          <p className="mt-4 text-mauve-600">
            No blocks yet for this week. Add your biweekly availability so clients only see real
            openings.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {blocks.map((b) => (
              <li
                key={b.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-4 py-3 ${stateStyles[b.state]}`}
              >
                <div>
                  <p className="font-semibold">
                    {new Date(b.startAt).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {new Date(b.endAt).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  {b.note ? <p className="text-sm opacity-90 mt-1">{b.note}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => void removeBlock(b.id)}
                  className="text-sm font-semibold underline opacity-90 hover:opacity-100 self-start sm:self-center"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
