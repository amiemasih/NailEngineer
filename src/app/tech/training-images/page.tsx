import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { assertTechSession } from "@/lib/tech-session-server";
import { TrainingImageGallery } from "@/components/TrainingImageGallery";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Submitted training images, Nail Engineer",
  robots: { index: false, follow: false },
};

const FINGER_LABEL: Record<string, string> = {
  thumb: "Thumb",
  index: "Index",
  middle: "Middle",
  ring: "Ring",
  pinky: "Pinky",
};

function parseFingers(json: string): string[] {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr)
      ? arr.map((f) => FINGER_LABEL[f] ?? f)
      : [];
  } catch {
    return [];
  }
}

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function TechTrainingImagesPage() {
  await assertTechSession();

  const [submissions, popOffs] = await Promise.all([
    prisma.trainingSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { _count: { select: { images: true } } },
    }),
    prisma.popOffReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { _count: { select: { images: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
        Nail Engineer · AI training pipeline
      </p>
      <h1 className={`mt-2 ${PAGE_TITLE_CLASS}`}>Submitted images</h1>

      <div className="mt-6">
        <Link
          href="/tech/dashboard"
          className="text-sm font-semibold text-mauve-600 hover:text-rose-900 hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>

      {/* Attributed submission log */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-rose-900">
          Submissions by source
        </h2>
        {submissions.length === 0 ? (
          <p className="mt-3 text-sm text-mauve-600">No submissions yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-cream-200">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-mauve-600">
                <tr>
                  <th className="px-4 py-2">Submitter</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Step</th>
                  <th className="px-4 py-2">Photos</th>
                  <th className="px-4 py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-t border-cream-200">
                    <td className="px-4 py-2 font-medium text-rose-900">
                      {s.submitterName}
                    </td>
                    <td className="px-4 py-2 capitalize text-mauve-600">
                      {s.submitterType}
                    </td>
                    <td className="px-4 py-2 text-mauve-600">{s.stepTitle}</td>
                    <td className="px-4 py-2 tabular-nums">{s._count.images}</td>
                    <td className="px-4 py-2 text-mauve-600">
                      {fmtDate(s.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pop-off reports */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-rose-900">
          Pop-off reports
        </h2>
        {popOffs.length === 0 ? (
          <p className="mt-3 text-sm text-mauve-600">No pop-off reports yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {popOffs.map((r) => {
              const left = parseFingers(r.leftFingers);
              const right = parseFingers(r.rightFingers);
              return (
                <li
                  key={r.id}
                  className="rounded-2xl border border-cream-200 bg-white p-4 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-rose-900">
                      {r.submitterName}{" "}
                      <span className="font-normal capitalize text-mauve-600">
                        · {r.submitterType}
                      </span>
                    </span>
                    <span className="text-xs text-mauve-600">
                      reported {fmtDate(r.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-1 text-mauve-700 sm:grid-cols-2">
                    <p>
                      <span className="font-medium">Left:</span>{" "}
                      {left.length ? left.join(", ") : "none"}
                    </p>
                    <p>
                      <span className="font-medium">Right:</span>{" "}
                      {right.length ? right.join(", ") : "none"}
                    </p>
                    <p>
                      <span className="font-medium">Nails done:</span>{" "}
                      {fmtDate(r.nailsDoneDate)}
                    </p>
                    <p>
                      <span className="font-medium">Popped off:</span>{" "}
                      {fmtDate(r.poppedOffDate)}
                    </p>
                  </div>
                  {r.notes && (
                    <p className="mt-2 text-mauve-600">
                      <span className="font-medium">Notes:</span> {r.notes}
                    </p>
                  )}
                  {r._count.images > 0 && (
                    <p className="mt-2 text-xs text-mauve-600">
                      {r._count.images} photo
                      {r._count.images === 1 ? "" : "s"} in the{" "}
                      <code>pop-off-reports/</code> storage folder
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <TrainingImageGallery />
    </div>
  );
}
