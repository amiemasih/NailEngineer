import type { Metadata } from "next";
import Image from "next/image";
import { WarmBackground } from "@/components/WarmBackground";

export const metadata: Metadata = {
  title: "About The Nail Engineer, Nail Engineer",
  description:
    "Jayden Pean offers high-quality nail care with a focus on precision, detail, and personalized service-acrylic, Gel-X, and natural nails.",
};

export default function AboutPage() {
  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <WarmBackground />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700/60">
          The Nail Engineer
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.5rem)] font-normal leading-[1.05] tracking-tight text-stone-900">
          About The Nail Engineer
        </h1>

        <figure className="mt-10">
          <div className="relative overflow-hidden rounded-sm border border-stone-200 bg-[#fdfbf7] p-2 shadow-[0_22px_55px_-24px_rgba(68,64,60,0.55)]">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm sm:aspect-[5/4]">
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

        <div className="mt-8 rounded-sm border border-stone-200 bg-[#fdfbf7] p-7 shadow-[0_22px_55px_-24px_rgba(68,64,60,0.55)] sm:p-9">
          <div className="space-y-5 text-base leading-relaxed text-stone-700">
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
      </div>
    </div>
  );
}
