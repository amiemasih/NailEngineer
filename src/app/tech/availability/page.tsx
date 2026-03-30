import type { Metadata } from "next";
import Link from "next/link";
import { TechAvailabilityEditor } from "@/components/TechAvailabilityEditor";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";

export const metadata: Metadata = {
  title: "Availability — Nail Engineer",
  robots: { index: false, follow: false },
};

export default function TechAvailabilityPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/tech/dashboard"
        className="text-sm font-semibold text-rose-800 hover:underline"
      >
        ← Dashboard
      </Link>
      <h1 className={`mt-4 ${PAGE_TITLE_CLASS}`}>Biweekly availability</h1>
      <p className="mt-3 text-mauve-600 leading-relaxed max-w-2xl">
        Publish the furthest horizon you actually know—usually about two weeks for student
        schedules. Everything you save here filters the public{" "}
        <Link href="/book" className="font-semibold text-rose-800 hover:underline">
          Book Online
        </Link>{" "}
        page in real time.
      </p>
      <div className="mt-10">
        <TechAvailabilityEditor />
      </div>
    </div>
  );
}
