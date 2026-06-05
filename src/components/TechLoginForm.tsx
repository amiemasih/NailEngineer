"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { showDevHint?: boolean };

export function TechLoginForm({ showDevHint = false }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tech/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Login failed.");
        return;
      }
      router.push("/tech/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="tech-pw" className="block text-sm font-medium text-stone-700">
          Dashboard password
        </label>
        <input
          id="tech-pw"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        {showDevHint ? (
          <p className="mt-2 text-xs text-stone-500">
            Dev default:{" "}
            <code className="rounded bg-stone-100 px-1 text-stone-700">nail-engineer-tech-dev-2026</code>{" "}
            unless{" "}
            <code className="rounded bg-stone-100 px-1 text-stone-700">TECH_DASHBOARD_PASSWORD</code>{" "}
            is set.
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-stone-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Enter dashboard"}
      </button>
    </form>
  );
}
