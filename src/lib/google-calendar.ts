/**
 * Google Calendar sync (optional).
 *
 * To enable later:
 * 1. Create a Google Cloud project, enable Calendar API.
 * 2. OAuth2 or service account with domain-wide delegation (if Workspace).
 * 3. On confirmed booking, call calendar.events.insert on Jayden’s calendar.
 * 4. Subscribe to push notifications or poll to detect external changes → notify Jayden (email/SMS/in-app).
 *
 * This module is intentionally a stub so bookings work without GCP credentials.
 */
export type SyncResult =
  | { ok: true; eventId?: string }
  | { ok: false; reason: "not_configured" | "error"; detail?: string };

export async function syncBookingToGoogleIfConfigured(booking: {
  id: string;
  startAt: Date;
  endAt: Date;
  serviceName: string;
  clientName: string;
  clientEmail: string;
}): Promise<SyncResult> {
  void booking;
  if (!process.env.GOOGLE_CALENDAR_SYNC_ENABLED || process.env.GOOGLE_CALENDAR_SYNC_ENABLED !== "true") {
    return { ok: false, reason: "not_configured" };
  }
  // Implement calendar.events.insert here when credentials exist.
  return { ok: false, reason: "not_configured" };
}
