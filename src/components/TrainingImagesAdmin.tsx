import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TrainingImageGallery } from "@/components/TrainingImageGallery";

const FINGER_LABEL: Record<string, string> = {
  thumb: "Thumb",
  index: "Index",
  middle: "Middle",
  ring: "Ring",
  pinky: "Pinky",
};

// Shared warm surface treatments so every card matches the public pages.
const CARD =
  "rounded-sm border border-stone-200 bg-[#fdfbf7] shadow-[0_22px_55px_-24px_rgba(68,64,60,0.55)]";
const SECTION_TITLE =
  "font-display text-3xl font-normal tracking-tight text-stone-900";

function parseFingers(json: string): string[] {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.map((f) => FINGER_LABEL[f] ?? f) : [];
  } catch {
    return [];
  }
}

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

/**
 * Admin view of everything the AI training pipeline has collected: submissions
 * grouped by the person who sent them, pop-off reports, and the per-step image
 * gallery. Picking a submitter filters the gallery below to only their photos.
 * Shared by the tech dashboard. `source` is the selected submitter's name.
 */
export async function TrainingImagesAdmin({ source }: { source?: string }) {
  const [submissions, popOffs] = await Promise.all([
    prisma.trainingSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { images: true },
    }),
    prisma.popOffReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { _count: { select: { images: true } } },
    }),
  ]);

  // Group submissions by the person who submitted them.
  const groups = new Map<
    string,
    {
      name: string;
      type: string;
      submissionCount: number;
      photoCount: number;
      latest: Date;
      paths: string[];
    }
  >();
  for (const s of submissions) {
    const paths = s.images.map((i) => i.path);
    const g = groups.get(s.submitterName);
    if (g) {
      g.submissionCount += 1;
      g.photoCount += paths.length;
      g.paths.push(...paths);
      if (s.createdAt > g.latest) g.latest = s.createdAt;
    } else {
      groups.set(s.submitterName, {
        name: s.submitterName,
        type: s.submitterType,
        submissionCount: 1,
        photoCount: paths.length,
        latest: s.createdAt,
        paths,
      });
    }
  }
  const sources = [...groups.values()].sort(
    (a, b) => b.latest.getTime() - a.latest.getTime(),
  );

  const selected = source ? groups.get(source) : undefined;

  return (
    <>
      {/* Attributed submission log: pick a source to filter the gallery */}
      <section className="mt-14">
        <h2 className={SECTION_TITLE}>Submissions by source</h2>

        {submissions.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No submissions yet.</p>
        ) : (
          <div className={`mt-5 overflow-hidden ${CARD}`}>
            <div className="overflow-x-auto">
              <div className="min-w-[680px]">
                {/* Header */}
                <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr] gap-2 bg-[#f3ece0] px-4 py-3 text-xs uppercase tracking-wide text-stone-500">
                  <span>Submitter</span>
                  <span>Type</span>
                  <span>Submissions</span>
                  <span>Photos</span>
                  <span>Latest</span>
                </div>
                {/* Each whole row is a clickable toggle */}
                {sources.map((g) => {
                  const isSel = selected?.name === g.name;
                  return (
                    <Link
                      key={g.name}
                      href={
                        isSel
                          ? "/tech/dashboard"
                          : `/tech/dashboard?source=${encodeURIComponent(g.name)}`
                      }
                      aria-pressed={isSel}
                      className={`grid grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr] items-center gap-2 border-t border-stone-200 px-4 py-3 text-sm transition-colors ${
                        isSel ? "bg-amber-100/70" : "hover:bg-amber-50/60"
                      }`}
                    >
                      <span className="font-medium text-amber-800">
                        {g.name}
                        {isSel && (
                          <span className="ml-2 text-xs font-normal text-stone-500">
                            (filtering · click to clear)
                          </span>
                        )}
                      </span>
                      <span className="capitalize text-stone-500">{g.type}</span>
                      <span className="tabular-nums text-stone-700">
                        {g.submissionCount}
                      </span>
                      <span className="tabular-nums text-stone-700">
                        {g.photoCount}
                      </span>
                      <span className="text-stone-500">{fmtDate(g.latest)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <p className="border-t border-stone-200 px-4 py-2.5 text-xs text-stone-500">
              Click any row to show only that person&apos;s photos in the gallery
              below. Click it again to clear.
            </p>
          </div>
        )}
      </section>

      {/* Pop-off reports */}
      <section className="mt-14">
        <h2 className={SECTION_TITLE}>Pop-off reports</h2>
        {popOffs.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No pop-off reports yet.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {popOffs.map((r) => {
              const left = parseFingers(r.leftFingers);
              const right = parseFingers(r.rightFingers);
              return (
                <li key={r.id} className={`${CARD} p-5 text-sm`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-stone-900">
                      {r.submitterName}{" "}
                      <span className="font-normal capitalize text-stone-500">
                        · {r.submitterType}
                      </span>
                    </span>
                    <span className="text-xs text-stone-500">
                      reported {fmtDate(r.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-1 text-stone-700 sm:grid-cols-2">
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
                    <p className="mt-2 text-stone-500">
                      <span className="font-medium">Notes:</span> {r.notes}
                    </p>
                  )}
                  {r._count.images > 0 && (
                    <p className="mt-2 text-xs text-stone-500">
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

      <TrainingImageGallery
        filterPaths={selected ? selected.paths : null}
        filterLabel={selected?.name ?? null}
      />
    </>
  );
}
