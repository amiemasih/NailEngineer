import type { Metadata } from "next";
import { TechLoginForm } from "@/components/TechLoginForm";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";

export const metadata: Metadata = {
  title: "Tech login — Nail Engineer",
  robots: { index: false, follow: false },
};

export default function TechLoginPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className={`${PAGE_TITLE_CLASS} text-center`}>Technician sign-in</h1>
      <p className="mt-2 text-center text-sm text-mauve-600">
        Access availability and bookings only—separate from student accounts.
      </p>
      <div className="mt-10">
        <TechLoginForm showDevHint={process.env.NODE_ENV === "development"} />
      </div>
    </div>
  );
}
