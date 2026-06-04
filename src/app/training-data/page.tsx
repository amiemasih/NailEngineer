import type { Metadata } from "next";
import Link from "next/link";
import { WarmBackground } from "@/components/WarmBackground";
import { TrainingImageUploader } from "@/components/TrainingImageUploader";

export const metadata: Metadata = {
  title: "Training data | Nail Engineer",
  robots: { index: false, follow: false },
};

export default function TrainingDataPage() {
  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <WarmBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700/60">
          Nail Engineer · AI training pipeline
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.5rem)] font-normal leading-[1.05] tracking-tight text-stone-900">
          Training data
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">
          Upload reference photos for each stage of a service. Pick the step, drop the photos, and
          click submit!
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="text-sm font-semibold text-stone-600 underline decoration-stone-400 underline-offset-4 transition-colors hover:text-stone-900 hover:decoration-stone-700"
          >
            ← Back to home
          </Link>
        </div>

        <TrainingImageUploader />
      </div>
    </div>
  );
}
