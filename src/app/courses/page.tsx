import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { modules: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className={PAGE_TITLE_CLASS}>Courses</h1>
      <p className="mt-3 max-w-2xl text-mauve-600 text-lg">
        Structured paths from foundation to gel structure and nail health. Enroll after you sign
        in—your dashboard tracks every lesson.
      </p>

      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <li key={c.id}>
            <Link
              href={`/courses/${c.slug}`}
              className="group block h-full rounded-2xl border border-cream-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:border-rose-200"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                {c.level}
              </p>
              <h2 className="mt-2 font-display text-xl font-bold text-rose-900 group-hover:text-rose-800">
                {c.title}
              </h2>
              {c.subtitle ? (
                <p className="mt-1 text-sm text-mauve-600 line-clamp-2">{c.subtitle}</p>
              ) : null}
              <p className="mt-4 text-sm text-mauve-600 line-clamp-3 leading-relaxed">
                {c.description}
              </p>
              <div className="mt-6 flex items-center justify-between text-sm text-mauve-600">
                <span>{c.durationMins} min total</span>
                <span>{c._count.modules} modules</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
