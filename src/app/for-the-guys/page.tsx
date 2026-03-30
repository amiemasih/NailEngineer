import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";

export const metadata: Metadata = {
  title: "For the Guys — Nail Engineer",
  description:
    "Nail care and grooming for men—beginner-friendly courses, clear guides, and stigma-free education. Build habits with confidence.",
};

const PODCAST_COMING = [
  {
    title: "Hands 101",
    blurb: "Why nails matter for first impressions—and what “healthy” actually looks like.",
  },
  {
    title: "Breaking the bite",
    blurb: "Practical steps to slow nail biting without shame or gimmicks.",
  },
  {
    title: "Grooming in ten",
    blurb: "A short routine you can repeat between classes, shifts, or travel days.",
  },
] as const;

const GROOMING_GUIDES = [
  {
    title: "Trim & shape without overdoing it",
    detail: "File direction, length that still feels like you, and when to stop.",
  },
  {
    title: "Cuticles: clean, not destroyed",
    detail: "Softening, gentle pushing, and what to avoid if you are new to tools.",
  },
  {
    title: "Dry hands & weak nails",
    detail: "Hydration habits that stick—especially if you lift, type, or wash often.",
  },
  {
    title: "Before interviews & dates",
    detail: "A simple checklist so your hands match the effort you put in everywhere else.",
  },
] as const;

export default async function ForTheGuysPage() {
  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { modules: true } } },
  });

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6 sm:pt-20">
        <h1 className={PAGE_TITLE_CLASS}>For the Guys</h1>
        <p className="mt-4 text-lg text-mauve-600 leading-relaxed">
          A dedicated lane for men who want better nail care without the awkward vibes. We use plain
          language, structured lessons, and audio-friendly formats so you can learn at your pace,
          build habits, and feel like this stuff is normal—not a secret side quest.
        </p>
        <p className="mt-6 text-mauve-600 leading-relaxed">
          The goal is simple: <strong className="font-semibold text-ink">normalize self-care</strong>
          , give you a clear front door into nail education, and help you stay consistent long after
          the first try.
        </p>
      </div>

      <section className="mx-auto max-w-3xl px-4 mt-14 sm:px-6 space-y-4">
        <h2 className="font-display text-2xl font-bold text-rose-900">How we reduce intimidation</h2>
        <ul className="list-disc pl-5 space-y-2 text-mauve-600 leading-relaxed">
          <li>
            <strong className="font-semibold text-ink">Beginner-first pacing</strong> — Modules start
            with hygiene and habits before anything flashy.
          </li>
          <li>
            <strong className="font-semibold text-ink">Straight talk</strong> — No gatekeeping, no
            assuming you already live in salon culture.
          </li>
          <li>
            <strong className="font-semibold text-ink">Structure you can trust</strong> — Every step
            has a why, so you are never guessing what comes next.
          </li>
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-16 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-rose-900">Courses</h2>
          <p className="mt-3 text-mauve-600 leading-relaxed">
            Every path below is available to you here—start with fundamentals, then layer nail health
            or art when you are ready. Pick a course, then{" "}
            <Link href="/register" className="font-semibold text-rose-800 hover:underline">
              join as a student
            </Link>{" "}
            or{" "}
            <Link href="/login" className="font-semibold text-rose-800 hover:underline">
              continue learning
            </Link>{" "}
            to enroll.
          </p>
        </div>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <li key={c.id}>
              <Link
                href={`/courses/${c.slug}`}
                className="group block h-full rounded-2xl border border-cream-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:border-rose-200"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  {c.level}
                </p>
                <h3 className="mt-2 font-display text-xl font-bold text-rose-900 group-hover:text-rose-800">
                  {c.title}
                </h3>
                {c.subtitle ? (
                  <p className="mt-1 text-sm text-mauve-600 line-clamp-2">{c.subtitle}</p>
                ) : null}
                <p className="mt-4 text-sm text-mauve-600 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
                <p className="mt-6 text-sm font-semibold text-rose-800">
                  View course →
                </p>
              </Link>
            </li>
          ))}
        </ul>
        {courses.length === 0 ? (
          <p className="mt-8 text-mauve-600">
            New modules are on the way.{" "}
            <Link href="/contact" className="font-semibold text-rose-800 hover:underline">
              Contact us
            </Link>{" "}
            to get notified.
          </p>
        ) : null}
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-20 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-rose-900">Podcast-style audio</h2>
          <p className="mt-3 text-mauve-600 leading-relaxed">
            Short listens you can queue on a walk or between classes—same standards as the modules,
            just easier to fit into a busy day. Episodes drop here first; subscribe alerts are coming
            soon.
          </p>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PODCAST_COMING.map((ep) => (
            <li
              key={ep.title}
              className="rounded-2xl border border-dashed border-cream-300 bg-cream-50/80 p-6 flex flex-col"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Coming soon
              </p>
              <h3 className="mt-2 font-display text-lg font-bold text-rose-900">{ep.title}</h3>
              <p className="mt-2 text-sm text-mauve-600 leading-relaxed flex-1">{ep.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-20 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-rose-900">Grooming guides</h2>
          <p className="mt-3 text-mauve-600 leading-relaxed">
            Quick entry points if you are brand new—each topic maps to deeper lessons inside the
            courses above.
          </p>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {GROOMING_GUIDES.map((g) => (
            <li
              key={g.title}
              className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm"
            >
              <h3 className="font-display text-lg font-bold text-rose-900">{g.title}</h3>
              <p className="mt-2 text-sm text-mauve-600 leading-relaxed">{g.detail}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/courses"
            className="inline-flex rounded-full bg-rose-900 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-rose-800 transition-colors"
          >
            Browse all courses
          </Link>
          <Link
            href="/about"
            className="inline-flex rounded-full border border-cream-300 bg-white px-6 py-3 text-sm font-semibold text-rose-900 hover:border-rose-300 transition-colors"
          >
            Read our mission
          </Link>
        </div>
      </section>
    </div>
  );
}
