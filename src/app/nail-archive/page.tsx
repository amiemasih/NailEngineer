import type { Metadata } from "next";
import { ArchivePortfolioTile } from "@/components/ArchivePortfolioTile";
import { WarmBackground } from "@/components/WarmBackground";
import { ARCHIVE_ITEMS } from "@/lib/nail-archive";

export const metadata: Metadata = {
  title: "The Nail Archive, Nail Engineer",
  description:
    "JP’s nail portfolio-regular sets and nail art for inspiration. Browse looks for inspiration.",
};

export default function NailArchivePage() {
  return (
    <div className="relative isolate min-h-full overflow-hidden text-stone-900">
      <WarmBackground />

      <header className="mx-auto max-w-[1400px] px-4 pt-16 pb-12 sm:px-8 sm:pt-20 sm:pb-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-700/60">
          Portfolio
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.5rem)] font-normal leading-[1.05] tracking-tight text-stone-900">
          The Nail Archive
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-stone-500 sm:text-[15px]">
          A selection of The Nail Engineer&apos;s work.
        </p>
      </header>

      <div className="relative z-[1] mx-auto max-w-[1400px] px-4 pb-16 sm:px-8 sm:pb-20">
        <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {ARCHIVE_ITEMS.map((entry) => (
            <ArchivePortfolioTile key={entry.id} entry={entry} />
          ))}
        </ul>
      </div>
    </div>
  );
}
