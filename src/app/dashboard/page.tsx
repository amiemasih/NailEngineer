import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.userId },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          modules: {
            include: { lessons: true },
          },
        },
      },
    },
  });

  const rows = await Promise.all(
    enrollments.map(async (e) => {
      const allIds = e.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
      const n = allIds.length;
      const done = await prisma.lessonProgress.count({
        where: {
          userId: session.userId,
          lessonId: { in: allIds },
          completedAt: { not: null },
        },
      });
      const firstLesson = e.course.modules
        .slice()
        .sort((a, b) => a.order - b.order)[0]
        ?.lessons.slice()
        .sort((a, b) => a.order - b.order)[0];
      const pct = n ? Math.round((done / n) * 100) : 0;
      return { enrollment: e, done, total: n, pct, firstLesson };
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className={PAGE_TITLE_CLASS}>Your dashboard</h1>
      <p className="mt-2 text-mauve-600">
        Welcome back{session.email ? ` — ${session.email}` : ""}. Pick up where you left off.
      </p>

      {rows.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-cream-300 bg-cream-50/80 p-12 text-center">
          <p className="text-mauve-600">You have not enrolled in a course yet.</p>
          <Link
            href="/courses"
            className="mt-6 inline-flex rounded-full bg-rose-900 px-6 py-3 text-sm font-semibold text-cream-50"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-6">
          {rows.map(({ enrollment: e, done, total, pct, firstLesson }) => (
            <li
              key={e.id}
              className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-rose-900">
                  {e.course.title}
                </h2>
                <p className="mt-1 text-sm text-mauve-600">
                  {done} of {total} lessons complete · {pct}%
                </p>
                <div className="mt-3 h-2 max-w-md rounded-full bg-cream-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-zinc-700 to-zinc-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                {firstLesson ? (
                  <Link
                    href={`/learn/${e.course.slug}/${firstLesson.id}`}
                    className="inline-flex rounded-full bg-rose-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-rose-800"
                  >
                    {pct === 0 ? "Start" : "Continue"}
                  </Link>
                ) : null}
                <Link
                  href={`/courses/${e.course.slug}`}
                  className="inline-flex rounded-full border border-cream-300 px-5 py-2.5 text-sm font-semibold text-rose-900 hover:border-rose-400"
                >
                  Syllabus
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
