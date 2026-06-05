import type { Metadata } from "next";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { WarmBackground } from "@/components/WarmBackground";
import { techLogout } from "@/app/tech/dashboard/actions";
import { TrainingImagesAdmin } from "@/components/TrainingImagesAdmin";

export const metadata: Metadata = {
  title: "Training images dashboard, Nail Engineer",
  robots: { index: false, follow: false },
};

export default async function TechDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;

  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <WarmBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700/60">
              AI training pipeline
            </p>
            <h1 className={`mt-3 ${PAGE_TITLE_CLASS}`}>
              Submitted training images
            </h1>
          </div>
          <form action={techLogout} className="shrink-0">
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-amber-50 hover:text-amber-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z"
                  clipRule="evenodd"
                />
              </svg>
              Sign out
            </button>
          </form>
        </div>

        <TrainingImagesAdmin source={source} />
      </div>
    </div>
  );
}
