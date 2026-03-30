import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

type Props = {
  href?: string | null;
  showTagline?: boolean;
  tagline?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  markOnly?: boolean;
  /** Light lockup for dark hero backgrounds */
  variant?: "default" | "onDark";
};

const markSize = { sm: 26, md: 34, lg: 42 };
const textSize = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl sm:text-3xl",
};

/**
 * Primary brand lockup — same mark + wordmark everywhere for recognizability
 * when content is reshared without captions (see also /public/brand/).
 */
export function Logo({
  href = "/",
  showTagline = false,
  tagline = "",
  size = "md",
  className = "",
  markOnly = false,
  variant = "default",
}: Props) {
  const onDark = variant === "onDark";
  const mark = (
    <LogoMark
      className="shrink-0"
      variant={onDark ? "onDark" : "default"}
      width={markSize[size]}
      height={markSize[size]}
    />
  );

  if (markOnly) {
    const body = <span className={`inline-flex ${className}`}>{mark}</span>;
    if (href) {
      return (
        <Link
          href={href}
          aria-label="Nail Engineer home"
          className={
            onDark
              ? "inline-flex rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              : "inline-flex rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          }
        >
          {body}
        </Link>
      );
    }
    return body;
  }

  const inner = (
    <span className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {mark}
      <span className="flex min-w-0 flex-col text-left">
        <span
          className={`font-display font-bold tracking-tight leading-tight ${textSize[size]} ${
            onDark ? "text-zinc-100" : "text-rose-900"
          }`}
        >
          Nail Engineer
        </span>
        {showTagline && tagline ? (
          <span
            className={`hidden font-sans text-sm font-medium sm:block truncate ${
              onDark ? "text-zinc-300" : "text-mauve-600"
            }`}
          >
            {tagline}
          </span>
        ) : null}
      </span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label="Nail Engineer home"
        className={
          onDark
            ? "focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            : "focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        }
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
