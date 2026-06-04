/**
 * Google Calendar two-way sync for Jayden's booking calendar.
 *
 * - Inbound: getBusyIntervals() reads her calendar's busy time (freebusy) so
 *   school / travel / personal events automatically block bookable slots.
 * - Outbound: pushBookingEvent() / deleteBookingEvent() create and remove
 *   calendar events when clients book or a booking is cancelled.
 *
 * Auth is OAuth2 with a stored refresh token (one row in GoogleCalendarAccount).
 * Every function is a graceful no-op when OAuth env vars are missing or no
 * account is connected, so bookings keep working without Google configured.
 *
 * Required env:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET   OAuth client (Google Cloud Console)
 *   GOOGLE_OAUTH_REDIRECT_URI                e.g. http://localhost:3000/api/google/oauth/callback
 */
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import type { BlockLike } from "@/lib/booking-engine";

const ACCOUNT_ID = "default";
const ACCESS_TOKEN_SKEW_MS = 60 * 1000; // refresh a minute before expiry

/** OAuth scopes: read/write calendar events + freebusy, plus email for display. */
export const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.email",
];

/** True only when the OAuth client env vars are present. */
export function oauthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_OAUTH_REDIRECT_URI,
  );
}

function oauthClient(): OAuth2Client {
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
  });
}

/** Consent-screen URL. offline + consent prompt guarantees a refresh token. */
export function getAuthUrl(state?: string): string | null {
  if (!oauthConfigured()) return null;
  return oauthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_OAUTH_SCOPES,
    state,
  });
}

export type ExchangeResult =
  | { stored: true; email: string | null }
  | { stored: false; reason: "not_configured" | "no_refresh_token" };

/**
 * Exchange an OAuth code for tokens and persist the refresh token. The email
 * is cosmetic and may be null even on success.
 */
export async function exchangeCodeAndStore(code: string): Promise<ExchangeResult> {
  if (!oauthConfigured()) return { stored: false, reason: "not_configured" };
  const client = oauthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    // No refresh token means Google won't let us act offline, bail.
    return { stored: false, reason: "no_refresh_token" };
  }
  client.setCredentials(tokens);

  let email: string | null = null;
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (res.ok) {
      const info = (await res.json()) as { email?: string };
      email = info.email ?? null;
    }
  } catch {
    // Email is cosmetic; ignore failures.
  }

  await prisma.googleCalendarAccount.upsert({
    where: { id: ACCOUNT_ID },
    create: {
      id: ACCOUNT_ID,
      email,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token ?? null,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    },
    update: {
      email,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token ?? null,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    },
  });

  return { stored: true, email };
}

export type ConnectionStatus = {
  configured: boolean;
  connected: boolean;
  email: string | null;
  calendarId: string | null;
};

/** Dashboard-facing status: are env vars set, and is an account linked? */
export async function getConnectionStatus(): Promise<ConnectionStatus> {
  const configured = oauthConfigured();
  if (!configured) {
    return { configured: false, connected: false, email: null, calendarId: null };
  }
  const account = await prisma.googleCalendarAccount.findUnique({
    where: { id: ACCOUNT_ID },
  });
  return {
    configured: true,
    connected: Boolean(account),
    email: account?.email ?? null,
    calendarId: account?.calendarId ?? null,
  };
}

export async function isConnected(): Promise<boolean> {
  if (!oauthConfigured()) return false;
  const account = await prisma.googleCalendarAccount.findUnique({
    where: { id: ACCOUNT_ID },
    select: { id: true },
  });
  return Boolean(account);
}

/** Forget the stored account (does not revoke at Google's side). */
export async function disconnect(): Promise<void> {
  await prisma.googleCalendarAccount.deleteMany({ where: { id: ACCOUNT_ID } });
}

/**
 * Returns a valid access token for the connected account, refreshing and
 * persisting a new one when the cached token is missing or near expiry.
 * Returns null when not configured / not connected.
 */
async function getAccessToken(): Promise<{ token: string; calendarId: string } | null> {
  if (!oauthConfigured()) return null;
  const account = await prisma.googleCalendarAccount.findUnique({
    where: { id: ACCOUNT_ID },
  });
  if (!account) return null;

  const stillFresh =
    account.accessToken &&
    account.expiresAt &&
    account.expiresAt.getTime() - ACCESS_TOKEN_SKEW_MS > Date.now();
  if (stillFresh && account.accessToken) {
    return { token: account.accessToken, calendarId: account.calendarId };
  }

  const client = oauthClient();
  client.setCredentials({ refresh_token: account.refreshToken });
  const { token } = await client.getAccessToken();
  if (!token) return null;

  // getAccessToken refreshes credentials in-place; persist the new token/expiry.
  const expiry = client.credentials.expiry_date
    ? new Date(client.credentials.expiry_date)
    : null;
  await prisma.googleCalendarAccount.update({
    where: { id: ACCOUNT_ID },
    data: { accessToken: token, expiresAt: expiry },
  });

  return { token, calendarId: account.calendarId };
}

/**
 * Busy intervals from Jayden's Google Calendar within [start, end], returned as
 * UNAVAILABLE blocks so the booking engine treats them like manual blocks
 * (buffers included). Empty array when not connected or on any failure, we
 * never let a Google outage take the booking system down.
 */
export async function getBusyIntervals(start: Date, end: Date): Promise<BlockLike[]> {
  try {
    const auth = await getAccessToken();
    if (!auth) return [];

    const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: auth.calendarId }],
      }),
    });
    if (!res.ok) return [];

    const data = (await res.json()) as {
      calendars?: Record<string, { busy?: { start: string; end: string }[] }>;
    };
    const busy = data.calendars?.[auth.calendarId]?.busy ?? [];
    return busy.map((b) => ({
      startAt: new Date(b.start),
      endAt: new Date(b.end),
      state: "UNAVAILABLE" as const,
    }));
  } catch {
    return [];
  }
}

export type SyncResult =
  | { ok: true; eventId?: string }
  | { ok: false; reason: "not_configured" | "error"; detail?: string };

/**
 * Insert a calendar event for a confirmed booking. Returns the event id so the
 * caller can persist it for later deletion.
 */
export async function pushBookingEvent(booking: {
  id: string;
  startAt: Date;
  endAt: Date;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
}): Promise<SyncResult> {
  try {
    const auth = await getAccessToken();
    if (!auth) return { ok: false, reason: "not_configured" };

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        auth.calendarId,
      )}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: `${booking.serviceName}, ${booking.clientName}`,
          description: [
            `Client: ${booking.clientName}`,
            `Email: ${booking.clientEmail}`,
            booking.clientPhone ? `Phone: ${booking.clientPhone}` : null,
            `Booking id: ${booking.id}`,
          ]
            .filter(Boolean)
            .join("\n"),
          start: { dateTime: booking.startAt.toISOString() },
          end: { dateTime: booking.endAt.toISOString() },
        }),
      },
    );
    if (!res.ok) {
      return { ok: false, reason: "error", detail: `HTTP ${res.status}` };
    }
    const event = (await res.json()) as { id?: string };
    return { ok: true, eventId: event.id };
  } catch (err) {
    return {
      ok: false,
      reason: "error",
      detail: err instanceof Error ? err.message : "unknown",
    };
  }
}

/** Delete a previously-pushed calendar event (e.g. on cancellation). */
export async function deleteBookingEvent(eventId: string): Promise<SyncResult> {
  try {
    const auth = await getAccessToken();
    if (!auth) return { ok: false, reason: "not_configured" };

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        auth.calendarId,
      )}/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );
    // 410 Gone means it was already deleted, treat as success.
    if (!res.ok && res.status !== 410 && res.status !== 404) {
      return { ok: false, reason: "error", detail: `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: "error",
      detail: err instanceof Error ? err.message : "unknown",
    };
  }
}
