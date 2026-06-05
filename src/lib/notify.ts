/**
 * Server-only email notifications for the AI training-image pipeline.
 *
 * Uses the Resend HTTP API directly (no SDK dependency) so a submission can
 * ping the team without adding packages. Sending is best-effort: failures are
 * logged and swallowed so they never break a tech's upload.
 *
 * Required env to actually send:
 *   RESEND_API_KEY            Resend API key (re_…)
 * Optional:
 *   TRAINING_NOTIFY_EMAIL     recipient (default: amiemasih2027@u.northwestern.edu)
 *   TRAINING_NOTIFY_FROM      verified sender (default: onboarding@resend.dev)
 */

// Default recipients for production. TRAINING_NOTIFY_EMAIL can override with a
// comma-separated list. NOTE: the sandbox sender below only delivers to the
// Resend account owner until nailengineer.org is verified at resend.com/domains.
const DEFAULT_TO = "thenailengineermail@gmail.com,peanjayden@gmail.com";
// Resend's shared sandbox sender works without verifying a domain, but can
// only deliver to the Resend account owner's address. Set TRAINING_NOTIFY_FROM
// to an address on your own verified domain (e.g. notify@nailengineer.org) for
// production delivery.
const DEFAULT_FROM = "Nail Engineer <onboarding@resend.dev>";

export function notificationsConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Recipient list, parsed from TRAINING_NOTIFY_EMAIL (comma-separated). */
function recipients(): string[] {
  return (process.env.TRAINING_NOTIFY_EMAIL || DEFAULT_TO)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Low-level best-effort send. Returns true on success; never throws. */
async function sendEmail(subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Not configured, quietly skip so uploads still work in dev.
    return false;
  }
  const to = recipients();
  const from = process.env.TRAINING_NOTIFY_FROM || DEFAULT_FROM;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("notify send failed", res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error("notify send error", err);
    return false;
  }
}

export type SubmissionNotice = {
  stepTitle: string;
  stepId: string;
  uploadedCount: number;
  submitterName?: string;
  submitterType?: string;
};

/**
 * Email the team that a step's training images changed. Returns true if the
 * send succeeded; never throws.
 */
export async function notifyTrainingSubmission(
  notice: SubmissionNotice,
): Promise<boolean> {
  // Format in Central time. The server (Vercel) runs in UTC, so without an
  // explicit timeZone the timestamp would render ~5-6 hours ahead of local time.
  const when = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Chicago",
  });

  const count = notice.uploadedCount;
  const plural = count === 1 ? "image" : "images";
  const who = notice.submitterName
    ? `${notice.submitterName}` +
      (notice.submitterType ? ` (${notice.submitterType})` : "")
    : "Someone";
  const subject = `Nail training images: changes to "${notice.stepTitle}"`;
  const text =
    `${who} submitted training photos for step "${notice.stepTitle}".\n\n` +
    `${count} new ${plural} submitted (${when} CT).\n\n` +
    `View them in the Supabase storage bucket under the ` +
    `${notice.stepId}/ folder.`;

  return sendEmail(subject, text);
}

export type PopOffNotice = {
  submitterName?: string;
  submitterType?: string;
  leftFingers: string[];
  rightFingers: string[];
  nailsDoneDate?: string | null;
  poppedOffDate?: string | null;
  notes?: string | null;
  photoCount: number;
};

/**
 * Email the team that a tech reported nails popping off. Best-effort; never
 * throws.
 */
export async function notifyPopOff(notice: PopOffNotice): Promise<boolean> {
  const who = notice.submitterName
    ? `${notice.submitterName}` +
      (notice.submitterType ? ` (${notice.submitterType})` : "")
    : "Someone";
  const fingers = (hand: string, list: string[]) =>
    list.length ? `${hand}: ${list.join(", ")}` : `${hand}: none`;

  const subject = "Nail Engineer: a pop-off was reported";
  const lines = [
    `${who} reported that nails popped off.`,
    "",
    fingers("Left hand", notice.leftFingers),
    fingers("Right hand", notice.rightFingers),
    "",
    `Nails done: ${notice.nailsDoneDate || "-"}`,
    `Popped off: ${notice.poppedOffDate || "-"}`,
  ];
  if (notice.notes) lines.push("", `Notes: ${notice.notes}`);
  if (notice.photoCount > 0) {
    lines.push(
      "",
      `${notice.photoCount} photo${notice.photoCount === 1 ? "" : "s"} ` +
        `attached, see the pop-off-reports/ folder in Supabase storage.`,
    );
  }

  return sendEmail(subject, lines.join("\n"));
}
