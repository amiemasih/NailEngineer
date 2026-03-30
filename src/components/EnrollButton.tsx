"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  courseId: string;
  enrolled: boolean;
  isLoggedIn: boolean;
  loginNextPath: string;
};

export function EnrollButton({
  courseId,
  enrolled,
  isLoggedIn,
  loginNextPath,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(loginNextPath)}`}
        className="inline-flex items-center justify-center rounded-full bg-rose-900 px-8 py-3 text-sm font-semibold text-cream-50 hover:bg-rose-800 transition-colors"
      >
        Log in to enroll
      </Link>
    );
  }

  async function enroll() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not enroll.");
        return;
      }
      router.refresh();
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (enrolled) {
    return (
      <p className="text-sm font-medium text-zinc-800 bg-cream-50 border border-cream-300 rounded-xl px-4 py-3">
        You are enrolled. Continue from your dashboard or open any lesson below.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={enroll}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full bg-rose-900 px-8 py-3 text-sm font-semibold text-cream-50 hover:bg-rose-800 disabled:opacity-60 transition-colors"
      >
        {loading ? "Enrolling…" : "Enroll in this course"}
      </button>
      {error ? <p className="text-sm text-zinc-800 font-medium">{error}</p> : null}
    </div>
  );
}
