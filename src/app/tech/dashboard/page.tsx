import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { prisma } from "@/lib/prisma";
import {
  cancelBooking,
  disconnectGoogleCalendar,
  techLogout,
} from "@/app/tech/dashboard/actions";
import { getConnectionStatus } from "@/lib/google-calendar";

export const metadata: Metadata = {
  title: "Scheduling dashboard, Nail Engineer",
  robots: { index: false, follow: false },
};

const GOOGLE_BANNER: Record<string, { text: string; tone: "ok" | "warn" }> = {
  connected: { text: "Google Calendar connected, sync is live.", tone: "ok" },
  denied: { text: "Google connection was cancelled.", tone: "warn" },
  no_refresh: {
    text: "Google did not return a refresh token. Disconnect at myaccount.google.com/permissions, then connect again.",
    tone: "warn",
  },
  not_configured: {
    text: "Google OAuth env vars are missing, add them and redeploy.",
    tone: "warn",
  },
  error: { text: "Something went wrong connecting Google Calendar.", tone: "warn" },
};

export default async function TechDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const { google } = await searchParams;
  const banner = google ? GOOGLE_BANNER[google] : undefined;

  const now = new Date();
  const upcoming = await prisma.booking.findMany({
    where: { status: "confirmed", endAt: { gte: now } },
    orderBy: { startAt: "asc" },
    take: 25,
  });

  const blockCount = await prisma.availabilityBlock.count({
    where: { endAt: { gte: now } },
  });

  const googleStatus = await getConnectionStatus();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            Jayden · Scheduling control center
          </p>
          <h1 className={`mt-2 ${PAGE_TITLE_CLASS}`}>Dashboard</h1>
        </div>
        <form action={techLogout} className="shrink-0">
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-mauve-600 hover:bg-cream-100 hover:text-rose-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z"
                clipRule="evenodd"
              />
            </svg>
            Sign out
          </button>
        </form>
      </div>

      {banner && (
        <div
          className={`mt-6 rounded-xl border px-4 py-3 text-sm font-medium ${
            banner.tone === "ok"
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/tech/availability"
          className="inline-flex rounded-full bg-rose-900 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-rose-800 transition-colors"
        >
          Manage availability
        </Link>
        <Link
          href="/tech/training-images"
          className="inline-flex rounded-full border border-cream-300 bg-white px-6 py-3 text-sm font-semibold text-rose-900 hover:border-rose-300 transition-colors"
        >
          Submitted training images
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-rose-900">Availability horizon</h2>
          <p className="mt-2 text-3xl font-bold text-rose-900 tabular-nums">{blockCount}</p>
          <p className="mt-1 text-sm text-mauve-600">
            Future blocks on file. Add two weeks at a time with travel and personal buffers baked
            into each window, not the raw start time of your next commitment.
          </p>
          {googleStatus.connected && (
            <p className="mt-3 text-xs font-medium text-green-700">
              Plus busy time pulled live from Google Calendar.
            </p>
          )}
        </section>
        <section className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-rose-900">Google Calendar</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                googleStatus.connected
                  ? "bg-green-100 text-green-800"
                  : "bg-cream-200 text-mauve-600"
              }`}
            >
              {googleStatus.connected ? "Connected" : "Not connected"}
            </span>
          </div>
          {!googleStatus.configured ? (
            <p className="mt-2 text-sm text-mauve-600 leading-relaxed">
              OAuth credentials are not set yet. Add GOOGLE_CLIENT_ID,
              GOOGLE_CLIENT_SECRET, and GOOGLE_OAUTH_REDIRECT_URI to the
              environment, then reload to connect.
            </p>
          ) : googleStatus.connected ? (
            <>
              <p className="mt-2 text-sm text-mauve-600 leading-relaxed">
                Bookings sync to{" "}
                <span className="font-medium text-rose-900">
                  {googleStatus.email ?? "your calendar"}
                </span>{" "}
                automatically, and your existing events block off slots so
                clients cannot double-book you.
              </p>
              <form action={disconnectGoogleCalendar} className="mt-4">
                <button
                  type="submit"
                  className="inline-flex rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-rose-900 hover:border-rose-300 transition-colors"
                >
                  Disconnect
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-mauve-600 leading-relaxed">
                Connect your Google Calendar so new bookings appear as events and
                your school, travel, and personal events automatically block off
                bookable slots.
              </p>
              <a
                href="/api/google/oauth/start"
                className="mt-4 inline-flex rounded-full bg-rose-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-rose-800 transition-colors"
              >
                Connect Google Calendar
              </a>
            </>
          )}
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
