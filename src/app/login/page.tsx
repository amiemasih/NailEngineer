import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-lg">
        <h1 className={PAGE_TITLE_CLASS}>Welcome back</h1>
        <p className="mt-2 text-mauve-600">Sign in to enroll, track lessons, and resume learning.</p>
        <div className="mt-10">
          <Suspense fallback={<p className="text-mauve-600">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-8 text-sm text-mauve-600">
          New here?{" "}
          <Link href="/register" className="font-semibold text-rose-800 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
