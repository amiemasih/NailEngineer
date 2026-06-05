import type { Metadata } from "next";
import { TechLoginForm } from "@/components/TechLoginForm";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { WarmBackground } from "@/components/WarmBackground";

export const metadata: Metadata = {
  title: "Admin sign-in, Nail Engineer",
  robots: { index: false, follow: false },
};

export default function TechLoginPage() {
  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <WarmBackground />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-20 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-700/60">
          Nail Engineer
        </p>
        <h1 className={`mt-3 ${PAGE_TITLE_CLASS} text-center`}>Admin sign-in</h1>

        <div className="mt-10 rounded-sm border border-stone-200 bg-[#fdfbf7] p-7 shadow-[0_22px_55px_-24px_rgba(68,64,60,0.55)] sm:p-9">
          <TechLoginForm showDevHint={process.env.NODE_ENV === "development"} />
        </div>
      </div>
    </div>
  );
}
