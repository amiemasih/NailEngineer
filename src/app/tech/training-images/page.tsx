import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { assertTechSession } from "@/lib/tech-session-server";
import { TrainingImageGallery } from "@/components/TrainingImageGallery";

export const metadata: Metadata = {
  title: "Submitted training images — Nail Engineer",
  robots: { index: false, follow: false },
};

export default async function TechTrainingImagesPage() {
  await assertTechSession();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
        Nail Engineer · AI training pipeline
      </p>
      <h1 className={`mt-2 ${PAGE_TITLE_CLASS}`}>Submitted images</h1>
      <p className="mt-3 max-w-2xl text-mauve-600 text-lg leading-relaxed">
        Every photo techs have submitted, by step. Click a thumbnail to open the full-size image in
        a new tab. This view is private to you—the public upload page never lists submissions.
      </p>

      <div className="mt-6">
        <Link
          href="/tech/dashboard"
          className="text-sm font-semibold text-mauve-600 hover:text-rose-900 hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>

      <TrainingImageGallery />
    </div>
  );
}
