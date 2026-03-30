"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MAIN_NAV } from "@/lib/nav";
import { Logo } from "@/components/Logo";

type Session = { userId: string; email: string } | null;

type Props = { session: Session };

const SCROLL_THRESHOLD = 48;

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SessionLinks({
  session,
  onNavigate,
  className,
}: {
  session: Session;
  onNavigate?: () => void;
  className?: string;
}) {
  if (!session) return null;
  const link = "rounded-lg px-2 py-2 hover:text-rose-800 transition-colors";
  return (
    <div className={className}>
      <Link href="/dashboard" className={link} onClick={onNavigate}>
        Dashboard
      </Link>
      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="w-full text-left rounded-lg px-2 py-2 text-rose-700 hover:text-rose-900 transition-colors md:w-auto"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

export function HeaderShell({ session }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, onScroll]);

  const heroBar = isHome && !scrolled;
  const linkClass =
    "rounded-lg px-2 py-2 hover:text-rose-800 transition-colors whitespace-nowrap text-mauve-600";

  return (
    <header
      className={
        heroBar
          ? "relative sticky top-0 z-50 border-b border-transparent bg-transparent pt-[env(safe-area-inset-top,0px)]"
          : "relative sticky top-0 z-50 border-b border-cream-200 bg-cream-50/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md transition-colors duration-300"
      }
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="shrink-0">
          <Logo size="lg" variant={heroBar ? "onDark" : "default"} />
        </div>

        {heroBar ? (
          <>
            {session ? (
              <nav
                aria-label="Account"
                className="hidden md:flex md:flex-1 md:items-center md:justify-end"
              >
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-medium text-zinc-100 hover:text-white transition-colors"
                >
                  <UserIcon />
                  Dashboard
                </Link>
              </nav>
            ) : null}

            <button
              type="button"
              className="md:hidden rounded-lg border border-white/40 bg-black/20 px-3 py-2 text-sm font-medium text-zinc-100 backdrop-blur-sm"
              aria-expanded={open}
              aria-controls="site-nav-mobile"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Close" : "Menu"}
            </button>

            {open ? (
              <nav
                id="site-nav-mobile"
                aria-label="Main mobile"
                className="md:hidden absolute left-0 right-0 top-full z-40 flex flex-col gap-1 border-b border-cream-200 bg-cream-50 px-4 py-4 text-sm font-medium text-mauve-600 shadow-lg"
              >
                {MAIN_NAV.map((item) => (
                  <Link key={item.href} href={item.href} className={linkClass} onClick={close}>
                    {item.label}
                  </Link>
                ))}
                {session ? (
                  <div className="mt-3 border-t border-cream-200 pt-3 flex flex-col gap-2">
                    <SessionLinks session={session} onNavigate={close} className="flex flex-col gap-2" />
                  </div>
                ) : null}
              </nav>
            ) : null}
          </>
        ) : (
          <>
            <nav
              aria-label="Main"
              className="hidden md:flex md:flex-1 md:flex-wrap md:items-center md:justify-end md:gap-x-4 lg:gap-x-5 text-sm font-medium text-mauve-600"
            >
              {MAIN_NAV.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              ))}
              {session ? (
                <SessionLinks
                  session={session}
                  className="ml-2 flex flex-wrap items-center gap-3 border-l border-cream-200 pl-4 lg:ml-4"
                />
              ) : null}
            </nav>

            <button
              type="button"
              className="md:hidden rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm font-medium text-rose-900"
              aria-expanded={open}
              aria-controls="site-nav-mobile"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Close" : "Menu"}
            </button>

            {open ? (
              <nav
                id="site-nav-mobile"
                aria-label="Main mobile"
                className="md:hidden absolute left-0 right-0 top-full z-40 flex flex-col gap-1 border-b border-cream-200 bg-cream-50 px-4 py-4 text-sm font-medium text-mauve-600 shadow-lg"
              >
                {MAIN_NAV.map((item) => (
                  <Link key={item.href} href={item.href} className={linkClass} onClick={close}>
                    {item.label}
                  </Link>
                ))}
                {session ? (
                  <div className="mt-3 border-t border-cream-200 pt-3 flex flex-col gap-2">
                    <SessionLinks session={session} onNavigate={close} className="flex flex-col gap-2" />
                  </div>
                ) : null}
              </nav>
            ) : null}
          </>
        )}
      </div>
    </header>
  );
}
