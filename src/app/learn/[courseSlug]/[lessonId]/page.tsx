import Link from "next/link";
import { notFound } from "next/navigation";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { LessonMarkdown } from "@/components/LessonMarkdown";
import { LessonProgressToggle } from "@/components/LessonProgressToggle";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Props = { params: Promise<{ courseSlug: string; lessonId: string }> };

export default async function LessonPage({ params }: Props) {
  const { courseSlug, lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: true,
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!lesson || lesson.module.course.slug !== courseSlug) notFound();

  const session = await getSession();
  if (!session) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.userId, courseId: lesson.module.courseId },
    },
  });

  if (!enrollment) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className={PAGE_TITLE_CLASS}>Enroll to access lessons</h1>
        <p className="mt-3 text-mauve-600">
          Join this course from the course page to unlock modules and track progress.
        </p>
        <Link
          href={`/courses/${courseSlug}`}
          className="mt-8 inline-block rounded-full bg-rose-900 px-6 py-3 text-sm font-semibold text-cream-50"
        >
          Go to course
        </Link>
      </div>
    );
  }

  const progress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: { userId: session.userId, lessonId },
    },
  });

  const course = lesson.module.course;
  const modules = await prisma.courseModule.findMany({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  const allLessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
  const completedRows = await prisma.lessonProgress.findMany({
    where: {
      userId: session.userId,
      lessonId: { in: allLessonIds },
      completedAt: { not: null },
    },
  });
  const completedSet = new Set(completedRows.map((r) => r.lessonId));
  const totalLessons = allLessonIds.length;
  const done = completedSet.size;
  const pct = totalLessons ? Math.round((done / totalLessons) * 100) : 0;

  const prevNext = (() => {
    const flat = modules.flatMap((m) => m.lessons);
    const idx = flat.findIndex((l) => l.id === lessonId);
    return {
      prev: idx > 0 ? flat[idx - 1] : null,
      next: idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null,
    };
  })();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/courses/${courseSlug}`}
            className="text-sm font-medium text-rose-800 hover:text-rose-900"
          >
            ← {course.title}
          </Link>
          <h1 className={`mt-2 ${PAGE_TITLE_CLASS}`}>{lesson.title}</h1>
          <p className="mt-1 text-sm text-mauve-600">
            {lesson.module.title} · {lesson.durationMins} min read
          </p>
        </div>
        <div className="rounded-2xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm w-full sm:max-w-xs">
          <div className="flex justify-between text-mauve-600">
            <span>Course progress</span>
            <span className="font-semibold text-rose-900">{pct}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-cream-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-zinc-700 to-zinc-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <LessonMarkdown content={lesson.contentMd} />
          <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-cream-200 pt-8">
            <LessonProgressToggle
              lessonId={lesson.id}
              initialCompleted={!!progress?.completedAt}
            />
            {prevNext.prev ? (
              <Link
                href={`/learn/${courseSlug}/${prevNext.prev.id}`}
                className="text-sm font-medium text-mauve-600 hover:text-rose-900"
              >
                ← Previous
              </Link>
            ) : null}
            {prevNext.next ? (
              <Link
                href={`/learn/${courseSlug}/${prevNext.next.id}`}
                className="text-sm font-semibold text-rose-900 hover:underline"
              >
                Next lesson →
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 h-fit rounded-2xl border border-cream-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-mauve-600">In this course</p>
          <nav className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            {modules.map((mod, mi) => (
              <div key={mod.id}>
                <p className="text-sm font-semibold text-rose-900">
                  {mi + 1}. {mod.title}
                </p>
                <ul className="mt-2 space-y-1">
                  {mod.lessons.map((l, li) => {
                    const active = l.id === lessonId;
                    const doneLesson = completedSet.has(l.id);
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/learn/${courseSlug}/${l.id}`}
                          className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                            active
                              ? "bg-zinc-100 text-rose-900 font-medium"
                              : "text-mauve-600 hover:bg-cream-50"
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                              doneLesson ? "bg-zinc-700" : "bg-cream-300"
                            }`}
                            aria-hidden
                          />
                          <span>
                            {mi + 1}.{li + 1} {l.title}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
