import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { TrainingImageUploader } from "@/components/TrainingImageUploader";

export const metadata: Metadata = {
  title: "Training data | Nail Engineer",
  robots: { index: false, follow: false },
};

export default function TrainingDataPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
        Nail Engineer · AI training pipeline
      </p>
      <h1 className={`mt-2 ${PAGE_TITLE_CLASS}`}>Training data</h1>
      <p className="mt-3 max-w-2xl text-mauve-600 text-lg leading-relaxed">
        Upload reference photos for each stage of a service. Pick the step, drop the photos, and
        they’re filed straight into that step’s own cloud folder, kept separate so the model trains
        on cleanly labeled stages.
      </p>

      <div className="mt-6">
        <Link href="/" className="text-sm font-semibold text-mauve-600 hover:text-rose-900 hover:underline">
          ← Back to home
        </Link>
      </div>

      <TrainingImageUploader />
    </div>
  );
}
