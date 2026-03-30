"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (typeof data.error === "string") {
          setError(data.error);
        } else {
          setError("Could not create account. Check your details.");
        }
        return;
      }
      router.push(next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-rose-900">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-ink focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-rose-900">
          Email
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-ink focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>
      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-rose-900">
          Password
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-ink focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <p className="mt-1 text-xs text-mauve-600">At least 8 characters.</p>
      </div>
      {error ? <p className="text-sm text-zinc-800 font-medium">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-rose-900 py-3 text-sm font-semibold text-cream-50 hover:bg-rose-800 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-mauve-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-rose-800 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
