import Image from "next/image";
import Link from "next/link";

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-cream-50 transition-opacity hover:opacity-85"
    >
      {children}
    </a>
  );
}

export default function HomePage() {
  return (
    <div className="bg-page">
      {/* Pull hero under transparent header */}
      <section className="relative -mt-[73px] min-h-[min(92vh,880px)] overflow-hidden pt-[7.25rem] pb-16 sm:pb-20">
        <Image
          src="/home/hero-newspaper.png"
          alt=""
          fill
          priority
          className="object-cover object-center contrast-[1.05] saturate-0"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-zinc-950/60" aria-hidden />
        <div className="relative z-10 mx-auto flex min-h-[calc(min(92vh,880px)-7.25rem)] max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6">
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.25rem)] font-normal leading-[1.05] tracking-tight text-zinc-50">
            Nail Engineer
          </h1>
          <p className="mt-5 max-w-xl font-sans text-base font-normal leading-relaxed text-zinc-200 sm:text-lg">
            Empowering your nail-care journey
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex min-w-[9.5rem] justify-center rounded-full bg-zinc-50 px-10 py-3.5 text-sm font-semibold text-zinc-950 shadow-sm transition-colors hover:bg-white"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      <section className="overflow-x-hidden border-t border-cream-200 bg-cream-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="relative border-2 border-zinc-900 bg-gradient-to-br from-cream-50 via-white to-zinc-200/30 p-7 shadow-[6px_6px_0_0_#3f3f46] sm:p-9 sm:shadow-[8px_8px_0_0_#52525b] md:p-11 md:shadow-[10px_10px_0_0_#71717a]">
            <div
              className="pointer-events-none absolute inset-3 border border-dashed border-zinc-400/45 sm:inset-4 md:inset-5"
              aria-hidden
            >
            </div>
            <div className="relative z-[1] grid grid-cols-1 gap-10 min-[680px]:grid-cols-[1fr_auto] min-[680px]:items-stretch min-[680px]:gap-8 lg:gap-10">
            <div className="flex min-h-0 min-w-0 flex-col items-center text-center min-[680px]:h-full min-[680px]:min-h-0">
              <h2 className="font-display text-[clamp(1.75rem,4.5vw,2.85rem)] font-normal leading-tight text-zinc-900 mb-10 sm:mb-12">
                <span className="text-zinc-500/85 text-[1.15em] leading-none">&ldquo;</span>
                <span className="mx-1.5 italic tracking-tight sm:mx-2">It&apos;s engineered growth</span>
                <span className="text-zinc-500/85 text-[1.15em] leading-none">&rdquo;</span>
              </h2>
              <div className="w-full max-w-2xl space-y-5 font-sans text-[15px] leading-relaxed text-zinc-700 sm:text-base min-[680px]:min-h-0 min-[680px]:flex-1">
                <p>
                  Two years ago, I took my girlfriend at the time to a nail appointment. I watched
                  the precision, the process, the transformation and said, I could do this.
                </p>
                <p>She laughed and said, &ldquo;You won&apos;t.&rdquo;</p>
                <p>That was all I needed.</p>
                <p>
                  At the time, I knew nothing about nails except that I bit my own. In an industry
                  where Black male nail technicians represent less than 1%, I felt overwhelmed and
                  underrepresented. I made the mistakes. I wasted money. I learned everything the
                  hard way.
                </p>
                <p>That experience built The Nail Engineer.</p>
                <p>
                  Today, as a licensed nail technician and founder of The Nail Engineer LLC, I
                  bring precision, discipline, and engineering-level attention to every set. But my
                  mission goes beyond the chair.
                </p>
                <p>
                  I&apos;m building a platform that gives beginner nail techs what I didn&apos;t
                  have, a clear starting point, step-by-step guidance, and the skills that aren&apos;t
                  often taught: communication, professionalism, marketing, nail prep, and
                  confidence.
                </p>
                <p>
                  This isn&apos;t a trend.
                  <br />
                  It&apos;s structure. It&apos;s representation. It&apos;s engineered growth.
                </p>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3 min-[680px]:mt-auto min-[680px]:pt-12">
                <SocialIcon href="https://www.instagram.com/" label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://www.tiktok.com/" label="TikTok">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </SocialIcon>
              </div>
            </div>
            <div className="flex shrink-0 justify-center min-[680px]:min-h-0 min-[680px]:justify-self-center min-[680px]:self-stretch min-[680px]:items-start">
              <Image
                src="/home/about-portrait.png"
                alt="Jayden with The Nail Engineer branded newspapers"
                width={293}
                height={1024}
                unoptimized
                sizes="(max-width: 679px) 280px, 380px"
                className="mx-auto h-auto max-h-[min(88vh,960px)] w-[min(100%,280px)] max-w-full object-contain object-top min-[680px]:h-[min(88vh,960px)] min-[680px]:w-auto min-[680px]:max-w-[380px]"
              />
            </div>
            </div>
          </div>
        </div>
        <div className="relative left-1/2 mt-12 aspect-[256/59] w-screen max-w-none -translate-x-1/2 overflow-hidden">
          <Image
            src="/home/about-workstation-banner.png"
            alt="Nail technician workstation"
            fill
            unoptimized
            className="object-cover object-center saturate-125 contrast-[1.12] brightness-[1.03]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-zinc-950/40" aria-hidden />
        </div>
      </section>

      <section className="border-t border-cream-200 bg-page">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
          <h2 className="font-display text-2xl font-normal text-zinc-900 sm:text-3xl">Get In Touch</h2>
          <p className="mx-auto mt-4 max-w-2xl font-sans text-[15px] leading-relaxed text-zinc-700 sm:text-base">
            Explore the{" "}
            <Link
              href="/nail-archive"
              className="font-semibold text-zinc-900 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-700"
            >
              Nail Archive
            </Link>{" "}
            to view Jayden&apos;s past sets and find inspiration for your own.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/book"
              className="inline-flex justify-center rounded-full bg-zinc-900 px-8 py-3.5 text-sm font-semibold text-cream-50 shadow-sm transition-colors hover:bg-zinc-800"
            >
              Book your appointment here
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
