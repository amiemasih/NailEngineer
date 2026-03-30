"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { lessonId: string; initialCompleted: boolean };

export function LessonProgressToggle({ lessonId, initialCompleted }: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !completed;
    setLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : "Update failed");
      }
      setCompleted(next);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
        completed
          ? "border-zinc-500 bg-zinc-100 text-zinc-900"
          : "border-cream-300 bg-white text-mauve-600 hover:border-rose-300"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${completed ? "bg-zinc-700" : "bg-cream-300"}`}
        aria-hidden
      />
      {loading ? "Saving…" : completed ? "Marked complete" : "Mark lesson complete"}
    </button>
  );
}
