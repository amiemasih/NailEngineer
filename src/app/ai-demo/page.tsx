import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AiDemo } from "@/components/AiDemo";

export const metadata: Metadata = {
  title: "See the AI in action | Nail Engineer",
  description:
    "Watch how Nail Engineer's AI reads a nail photo, identifies the service stage, and tells you exactly what to do next.",
};

export default function AiDemoPage() {
  return (
    <div className="relative isolate min-h-full overflow-hidden">
      {/* Warm, soft editorial background (warm stone, no harsh grid). */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 min-h-full bg-gradient-to-b from-stone-100 via-[#f7f3ec] to-stone-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 min-h-full bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(180,150,110,0.10),transparent_60%),radial-gradient(ellipse_90%_70%_at_0%_100%,rgba(168,162,158,0.10),transparent_52%),radial-gradient(ellipse_80%_60%_at_100%_100%,rgba(180,150,110,0.08),transparent_50%)]"
        aria-hidden
      />

      {/* Header hero, the nail-photo collage sits behind the title block with a
          warm glaze. */}
      <section className="relative overflow-hidden border-b border-stone-800 bg-stone-950">
        {/* Collage of nail photos as the header backdrop. */}
        <div className="absolute inset-0 grid grid-cols-3 gap-1 bg-stone-950" aria-hidden>
          {["/ai-demo/nails-2.jpg", "/ai-demo/header.jpg", "/ai-demo/nails-3.jpg"].map(
            (src) => (
              <div key={src} className="relative h-full w-full overflow-hidden">
                <Image
                  src={src}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover object-center saturate-[1.05] contrast-[1.05]"
                  sizes="34vw"
                  priority
                />
              </div>
            ),
          )}
        </div>
        {/* warm wash for legibility, kept lighter so the nail color shows */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/45 to-stone-950/70"
          aria-hidden
        />

        <div className="relative z-[1] mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/70">
            Nail Engineer · Live demo
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.5rem)] font-normal leading-[1.05] tracking-tight text-stone-50">
            See how the AI works
          </h1>

          {/* Intro card, a soft warm "clipping" pasted over the photo. */}
          <div className="relative mx-auto mt-10 max-w-2xl rounded-sm border border-stone-200/80 bg-[#fdfbf7] p-7 text-left shadow-[0_22px_55px_-24px_rgba(68,64,60,0.6)] sm:p-9">
            <div className="font-sans text-[15px] leading-relaxed text-stone-700 sm:text-base">
              <p className="font-semibold text-stone-900">What our AI tool does:</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-amber-600/50">
                <li>Your student uploads a photo of the nail.</li>
                <li>The tool identifies which stage of the service the nail is at.</li>
                <li>
                  It gives clear, specific advice on the next step, plus any prep
                  adjustments to make before moving on.
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              href="/"
              className="text-sm font-semibold text-stone-100 underline decoration-stone-400 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              ← Back to home
            </Link>
            <Link
              href="/training-data"
              className="text-sm font-semibold text-stone-100 underline decoration-stone-400 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              Upload your own photos
            </Link>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
        <AiDemo />
      </div>
    </div>
  );
}
