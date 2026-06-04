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
      className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-50 text-amber-700 transition-colors hover:text-amber-800"
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
          <div className="mt-12 flex flex-col items-center gap-4">
            <Link
              href="/training-data"
              className="inline-flex min-w-[9.5rem] justify-center rounded-full bg-zinc-50 px-10 py-3.5 text-sm font-semibold text-zinc-950 shadow-sm transition-colors hover:bg-white"
            >
              Upload your nail photos
            </Link>
            <Link
              href="/ai-demo"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-100 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              See how our AI works →
            </Link>
          </div>
        </div>
      </section>

      <section className="overflow-x-hidden border-t border-cream-200 bg-cream-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="relative border border-amber-700/30 bg-gradient-to-br from-cream-50 via-white to-zinc-200/30 p-7 shadow-[6px_6px_0_0_rgba(180,83,9,0.18)] sm:p-9 sm:shadow-[8px_8px_0_0_rgba(180,83,9,0.16)] md:p-11 md:shadow-[10px_10px_0_0_rgba(180,83,9,0.14)]">
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
                  Two years ago, I walked into a nail salon and watched it all unfold: the
                  precision, the process, the transformation. I said to myself, I could do this. So
                  I did.
                </p>
                <p>
                  In an industry where Black male nail technicians make up less than 1%, I felt
                  underrepresented. I made the mistakes, wasted the money, and learned it all the
                  hard way. That built The Nail Engineer.
                </p>
                <p>
                  Today, as a licensed nail technician and founder of The Nail Engineer LLC, I
                  bring precision and discipline to every set. But my mission goes beyond the chair:
                  I&apos;m building a platform that gives beginner nail techs what I didn&apos;t
                  have, a clear starting point, step-by-step guidance, and the skills that
                  aren&apos;t often taught, like communication, professionalism, and confidence.
                </p>
                <p>
                  This isn&apos;t a trend.
                  <br />
                  It&apos;s structure. It&apos;s representation. It&apos;s engineered growth.
                </p>
              </div>
              <div className="mt-12 flex flex-col items-center gap-6 min-[680px]:mt-auto min-[680px]:pt-12">
                <div className="flex flex-col items-center gap-4">
                  <p className="font-sans text-[13px] uppercase tracking-[0.18em] text-zinc-400">
                    Take a look at some of my best work
                  </p>
                  <Link
                    href="/nail-archive"
                    className="inline-flex items-center rounded-full bg-amber-700/90 px-8 py-3 font-display text-xl italic leading-none tracking-tight text-cream-50 shadow-[0_12px_26px_-12px_rgba(180,83,9,0.7)] ring-1 ring-inset ring-white/15 transition-colors hover:bg-amber-800"
                  >
                    The Nail Archive
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                <SocialIcon href="https://www.instagram.com/thenailengineer_/" label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </SocialIcon>
                </div>
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
      </section>

      {/* Get In Touch, overlaid on the workstation photo. */}
      <section className="relative overflow-hidden">
        <Image
          src="/home/about-workstation-banner.png"
          alt="Nail technician workstation"
          fill
          unoptimized
          className="object-cover object-center saturate-125 contrast-[1.12] brightness-[1.03]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-zinc-950/65" aria-hidden />
        <div className="relative z-[1] mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-24">
          <h2 className="font-display text-2xl font-normal text-zinc-50 sm:text-3xl">Get In Touch</h2>
          <p className="mx-auto mt-4 max-w-2xl font-sans text-[15px] leading-relaxed text-zinc-200 sm:text-base">
            Contact us at{" "}
            <a
              href="mailto:thenailengineermail@gmail.com"
              className="font-semibold text-white underline decoration-zinc-400 underline-offset-2 hover:decoration-white"
            >
              thenailengineermail@gmail.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
