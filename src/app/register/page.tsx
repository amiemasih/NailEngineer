import { Suspense } from "react";
import { RegisterForm } from "@/components/RegisterForm";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-lg">
        <h1 className={PAGE_TITLE_CLASS}>Create your account</h1>
        <p className="mt-2 text-mauve-600">
          Free to join. Enroll in courses and save progress across devices.
        </p>
        <div className="mt-10">
          <Suspense fallback={<p className="text-mauve-600">Loading…</p>}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
