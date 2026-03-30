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
    <form onSubmit={onSubmit} className="space-y-5 max-w-md mx-auto">
      <div>
        <label htmlFor="tech-pw" className="block text-sm font-medium text-rose-900">
          Dashboard password
        </label>
        <input
          id="tech-pw"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-ink focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        {showDevHint ? (
          <p className="mt-2 text-xs text-mauve-600">
            Dev default:{" "}
            <code className="bg-cream-100 px-1 rounded">nail-engineer-tech-dev-2026</code> unless{" "}
            <code className="bg-cream-100 px-1 rounded">TECH_DASHBOARD_PASSWORD</code> is set.
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-zinc-800 font-medium">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-rose-900 py-3 text-sm font-semibold text-cream-50 hover:bg-rose-800 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Enter dashboard"}
      </button>
    </form>
  );
}
