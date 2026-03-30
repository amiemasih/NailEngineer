import type { Metadata } from "next";
import { MarketingLayout } from "@/components/MarketingLayout";

export const metadata: Metadata = {
  title: "Contact — Nail Engineer",
  description: "Reach the Nail Engineer team—partnerships, press, and booking support.",
};

export default function ContactPage() {
  return (
    <MarketingLayout
      title="Contact"
      intro="Questions about courses, collaborations, or early access to booking—we read every note."
    >
      <p>
        Use this channel for education partnerships, local pop-ups, press, and
        client support while we finish self-serve scheduling. For course subscribers, future
        in-app notifications and community threads will complement email.
      </p>
      <div className="rounded-2xl border border-cream-200 bg-cream-50/80 p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-gold-600">Email</p>
        <p className="mt-2 text-rose-900 font-medium">hello@nailengineer.com</p>
        <p className="mt-3 text-sm text-mauve-600">
          Placeholder address—replace with your production inbox or form handler.
        </p>
      </div>
    </MarketingLayout>
  );
}
