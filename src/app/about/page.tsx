import type { Metadata } from "next";
import Image from "next/image";
import { MarketingLayout } from "@/components/MarketingLayout";

export const metadata: Metadata = {
  title: "About The Nail Engineer — Nail Engineer",
  description:
    "Jayden Pean offers high-quality nail care with a focus on precision, detail, and personalized service—acrylic, Gel-X, and natural nails.",
};

export default function AboutPage() {
  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 min-h-full bg-gradient-to-b from-zinc-200 via-zinc-100 to-zinc-200"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 min-h-full bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(63,63,70,0.09),transparent_58%),radial-gradient(ellipse_90%_70%_at_0%_100%,rgba(82,82,91,0.07),transparent_50%),radial-gradient(ellipse_80%_60%_at_100%_100%,rgba(63,63,70,0.08),transparent_48%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 min-h-full bg-[linear-gradient(135deg,transparent_46%,rgba(113,113,122,0.04)_50%,transparent_54%)] bg-[length:28px_28px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 min-h-full bg-[linear-gradient(rgba(113,113,122,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(113,113,122,0.11)_1px,transparent_1px)] bg-[size:44px_44px]"
        aria-hidden
      />

      <MarketingLayout title="About The Nail Engineer" className="relative z-10">
        <figure className="relative mx-auto">
          <div className="relative border-2 border-zinc-900 bg-gradient-to-br from-cream-50 via-white to-zinc-200/30 p-7 shadow-[6px_6px_0_0_#3f3f46] sm:p-9 sm:shadow-[8px_8px_0_0_#52525b] md:p-11 md:shadow-[10px_10px_0_0_#71717a]">
            <div
              className="pointer-events-none absolute inset-3 border border-dashed border-zinc-400/45 sm:inset-4 md:inset-5"
              aria-hidden
            />
            <div className="relative z-[1] aspect-[4/3] w-full overflow-hidden sm:aspect-[5/4]">
              <Image
                src="/about/jayden-at-work.png"
                alt="Jayden Pean working on a client's nails under the lamp, focused and precise."
                fill
                className="object-cover object-[center_30%]"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            </div>
          </div>
        </figure>
        <div className="relative border-2 border-zinc-900 bg-gradient-to-br from-cream-50 via-white to-zinc-200/30 p-7 shadow-[6px_6px_0_0_#3f3f46] sm:p-9 sm:shadow-[8px_8px_0_0_#52525b] md:p-11 md:shadow-[10px_10px_0_0_#71717a]">
          <div
            className="pointer-events-none absolute inset-3 border border-dashed border-zinc-400/45 sm:inset-4 md:inset-5"
            aria-hidden
          />
          <div className="relative z-[1] space-y-5 text-base leading-relaxed text-zinc-800">
            <p>
              Jayden Pean offers high-quality nail care with a focus on precision, detail, and
              personalized service. Working across acrylic, Gel-X, and natural nails, he creates sets
              that are clean, intentional, and tailored to each client.
            </p>
            <p>
              His approach centers on the individual. By understanding each client&apos;s preferences and
              lifestyle, Jayden ensures that every set feels both elevated and wearable. The result is a
              consistent, detail-driven experience that prioritizes both appearance and nail health.
            </p>
          </div>
        </div>
      </MarketingLayout>
    </div>
  );
}
