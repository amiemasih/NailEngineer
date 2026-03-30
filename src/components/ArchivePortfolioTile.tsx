import Image from "next/image";
import Link from "next/link";
import type { ArchiveEntry } from "@/lib/nail-archive";
import { formatDesignLabel } from "@/lib/nail-archive";

type Props = { entry: ArchiveEntry };

export function ArchivePortfolioTile({ entry }: Props) {
  const hasImage = Boolean(entry.imageSrc);
  const href = entry.primaryLink?.href ?? "/book";
  const label = formatDesignLabel(entry.designNumber);
  const alt =
    entry.imageAlt ?? `The Nail Engineer — ${label}, nail design sample`;

  return (
    <li className="relative aspect-[4/5] min-h-0 list-none">
      <Link
        href={href}
        className="group relative block h-full w-full overflow-hidden bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      >
        {hasImage && entry.imageSrc ? (
          <Image
            src={entry.imageSrc}
            alt={alt}
            fill
            className="object-cover transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.03] group-hover:brightness-[0.95]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-300"
            aria-hidden
          />
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 z-10 sm:bottom-4 sm:left-4">
          <p className="rounded bg-black/45 px-2.5 py-1.5 font-sans text-[9px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-[6px] sm:text-[10px] sm:tracking-[0.24em]">
            {label}
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-3 right-3 z-10 sm:bottom-4 sm:right-4">
          <Image
            src="/brand/nail-engineer-mark.svg"
            alt=""
            width={32}
            height={32}
            className="h-7 w-7 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] sm:h-8 sm:w-8"
          />
        </div>
      </Link>
    </li>
  );
}
