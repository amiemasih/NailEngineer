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

const DEFAULT_TO = "amiemasih2027@u.northwestern.edu";
// Resend's shared sandbox sender works without verifying a domain, but can
// only deliver to the Resend account owner's address. Set TRAINING_NOTIFY_FROM
// to an address on your own verified domain for production delivery.
const DEFAULT_FROM = "Nail Engineer <onboarding@resend.dev>";

export function notificationsConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export type SubmissionNotice = {
  stepTitle: string;
  stepId: string;
  uploadedCount: number;
};

/**
 * Email the team that a step's training images changed. Returns true if the
 * send succeeded; never throws.
 */
export async function notifyTrainingSubmission(
  notice: SubmissionNotice,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Not configured — quietly skip so uploads still work in dev.
    return false;
  }

  const to = process.env.TRAINING_NOTIFY_EMAIL || DEFAULT_TO;
  const from = process.env.TRAINING_NOTIFY_FROM || DEFAULT_FROM;
  const when = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const count = notice.uploadedCount;
  const plural = count === 1 ? "image" : "images";
  const subject = `Nail training images: changes to "${notice.stepTitle}"`;
  const text =
    `There have been changes to step "${notice.stepTitle}" of the nail ` +
    `training images.\n\n` +
    `${count} new ${plural} submitted (${when}).\n\n` +
    `View them in the Supabase storage bucket under the ` +
    `${notice.stepId}/ folder.`;

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
      console.error("training submission notify failed", res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error("training submission notify error", err);
    return false;
  }
}
