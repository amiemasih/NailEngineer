import type { Metadata } from "next";
import { ArchivePortfolioTile } from "@/components/ArchivePortfolioTile";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { ARCHIVE_ITEMS } from "@/lib/nail-archive";

export const metadata: Metadata = {
  title: "The Nail Archive — Nail Engineer",
  description:
    "JP’s nail portfolio—regular sets and nail art for inspiration. Browse looks, then book or explore services.",
};

export default function NailArchivePage() {
  return (
    <div className="min-h-full bg-white text-zinc-900">
      <header className="mx-auto max-w-[1400px] px-4 pt-16 pb-12 sm:px-8 sm:pt-20 sm:pb-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-400">
          Portfolio
        </p>
        <h1 className={`mt-3 ${PAGE_TITLE_CLASS}`}>The Nail Archive</h1>
        <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
          A selection of The Nail Engineer&apos;s work. Hover to explore. Click to book.
        </p>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-8 sm:pb-12">
        <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {ARCHIVE_ITEMS.map((entry) => (
            <ArchivePortfolioTile key={entry.id} entry={entry} />
          ))}
        </ul>
      </div>
    </div>
  );
}
