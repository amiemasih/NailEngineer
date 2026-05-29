import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { AiDemo } from "@/components/AiDemo";

export const metadata: Metadata = {
  title: "See the AI in action | Nail Engineer",
  description:
    "Watch how Nail Engineer's AI reads a nail photo, identifies the service stage, and tells you exactly what to do next.",
};

export default function AiDemoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
        Nail Engineer · Live demo
      </p>
      <h1 className={`mt-2 ${PAGE_TITLE_CLASS}`}>See how the AI works</h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-mauve-600">
        Pick a sample photo below. The AI uploads it, figures out which stage of the service the
        nail is at, and gives you clear advice on the next step. This is exactly the guidance you
        get after uploading your own photos.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href="/training-data"
          className="text-sm font-semibold text-mauve-600 transition-colors hover:text-rose-900 hover:underline"
        >
          Upload your own photos →
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold text-mauve-600 transition-colors hover:text-rose-900 hover:underline"
        >
          ← Back to home
        </Link>
      </div>

      <AiDemo />
    </div>
  );
}
