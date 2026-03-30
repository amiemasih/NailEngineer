import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { prisma } from "@/lib/prisma";
import { cancelBooking, techLogout } from "@/app/tech/dashboard/actions";

export const metadata: Metadata = {
  title: "Scheduling dashboard — Nail Engineer",
  robots: { index: false, follow: false },
};

export default async function TechDashboardPage() {
  const now = new Date();
  const upcoming = await prisma.booking.findMany({
    where: { status: "confirmed", endAt: { gte: now } },
    orderBy: { startAt: "asc" },
    take: 25,
  });

  const blockCount = await prisma.availabilityBlock.count({
    where: { endAt: { gte: now } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
        Jayden · Scheduling control center
      </p>
      <h1 className={`mt-2 ${PAGE_TITLE_CLASS}`}>Dashboard</h1>
      <p className="mt-3 max-w-2xl text-mauve-600 text-lg leading-relaxed">
        Update biweekly availability (clients see open slots immediately), review bookings, and keep
        buffers honest so school and travel do not collide with appointments.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/tech/availability"
          className="inline-flex rounded-full bg-rose-900 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-rose-800 transition-colors"
        >
          Manage availability
        </Link>
        <form action={techLogout}>
          <button
            type="submit"
            className="inline-flex rounded-full border border-cream-300 bg-white px-6 py-3 text-sm font-semibold text-rose-900 hover:border-rose-300 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-rose-900">Availability horizon</h2>
          <p className="mt-2 text-3xl font-bold text-rose-900 tabular-nums">{blockCount}</p>
          <p className="mt-1 text-sm text-mauve-600">
            Future blocks on file. Add two weeks at a time with travel and personal buffers baked
            into each window—not the raw start time of your next commitment.
          </p>
        </section>
        <section className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-rose-900">Google Calendar</h2>
          <p className="mt-2 text-sm text-mauve-600 leading-relaxed">
            Automatic sync is scaffolded in code but disabled until Google Calendar credentials are
            configured. When enabled, new bookings insert events and external conflicts can ping you
            for manual rescheduling.
          </p>
        </section>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-rose-900">Upcoming bookings</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-mauve-600">
            No confirmed appointments yet. When clients book online, they appear here and leave the
            public slot inventory.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <p className="font-display text-lg font-bold text-rose-900">{b.serviceName}</p>
                  <p className="text-sm text-mauve-600 mt-1">
                    {b.startAt.toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {b.endAt.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm text-ink mt-2">
                    {b.clientName} · {b.clientEmail}
                    {b.clientPhone ? ` · ${b.clientPhone}` : ""}
                  </p>
                </div>
                <form className="shrink-0" action={cancelBooking}>
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    className="text-sm font-semibold text-zinc-700 hover:underline"
                  >
                    Cancel booking
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
