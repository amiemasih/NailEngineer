import Link from "next/link";
import { notFound } from "next/navigation";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { EnrollButton } from "@/components/EnrollButton";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Props = { params: Promise<{ slug: string }> };

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!course) notFound();

  const session = await getSession();
  const enrollment = session
    ? await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId: session.userId, courseId: course.id },
        },
      })
    : null;

  const firstLesson = course.modules[0]?.lessons[0];
  const loginNextPath = firstLesson
    ? `/learn/${course.slug}/${firstLesson.id}`
    : `/courses/${course.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">{course.level}</p>
      <h1 className={`mt-2 ${PAGE_TITLE_CLASS}`}>{course.title}</h1>
      {course.subtitle ? (
        <p className="mt-2 text-xl text-mauve-600">{course.subtitle}</p>
      ) : null}
      <p className="mt-6 max-w-3xl text-mauve-600 leading-relaxed text-lg">{course.description}</p>

      <div className="mt-10 flex flex-wrap items-center gap-6">
        <EnrollButton
          courseId={course.id}
          enrolled={!!enrollment}
          isLoggedIn={!!session}
          loginNextPath={loginNextPath}
        />
        {enrollment && firstLesson ? (
          <Link
            href={`/learn/${course.slug}/${firstLesson.id}`}
            className="text-sm font-semibold text-rose-800 hover:text-rose-900 underline underline-offset-4"
          >
            Continue to first lesson →
          </Link>
        ) : null}
      </div>

      <section className="mt-16 border-t border-cream-200 pt-12">
        <h2 className="font-display text-2xl font-bold text-rose-900">Modules & lessons</h2>
        <ol className="mt-8 space-y-10">
          {course.modules.map((mod, mi) => (
            <li key={mod.id} className="rounded-2xl border border-cream-200 bg-cream-50/80 p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-gold-600 font-bold">
                  Module {mi + 1}
                </span>
                <h3 className="font-display text-xl font-bold text-rose-900">{mod.title}</h3>
              </div>
              <p className="mt-2 text-mauve-600">{mod.summary}</p>
              <ul className="mt-6 space-y-3">
                {mod.lessons.map((lesson, li) => (
                  <li key={lesson.id}>
                    {enrollment ? (
                      <Link
                        href={`/learn/${course.slug}/${lesson.id}`}
                        className="flex items-center justify-between gap-4 rounded-xl bg-white border border-cream-200 px-4 py-3 text-sm hover:border-rose-300 transition-colors"
                      >
                        <span className="font-medium text-ink">
                          {mi + 1}.{li + 1} {lesson.title}
                        </span>
                        <span className="text-mauve-600 shrink-0">{lesson.durationMins} min</span>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between gap-4 rounded-xl bg-white/60 border border-cream-200 px-4 py-3 text-sm text-mauve-600">
                        <span>
                          {mi + 1}.{li + 1} {lesson.title}
                        </span>
                        <span className="shrink-0">{lesson.durationMins} min</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
