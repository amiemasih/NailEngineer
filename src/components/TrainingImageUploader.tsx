"use client";

import { useEffect, useState } from "react";
import { TRAINING_STEPS, type TrainingStep } from "@/lib/training-steps";

type StagedImage = {
  /** Stable id so React keys survive removals. */
  id: string;
  file: File;
  previewUrl: string;
};

let stagedSeq = 0;

export function TrainingImageUploader() {
  const [activeStep, setActiveStep] = useState<TrainingStep>(TRAINING_STEPS[0]);
  const [staged, setStaged] = useState<StagedImage[]>([]);
  const [configured, setConfigured] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [thankYou, setThankYou] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // One-time check: is cloud storage wired up? (No image listing is exposed.)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/training-images")
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (!cancelled) setConfigured(data.configured !== false);
      })
      .catch(() => {
        /* leave optimistic; POST will surface a clear error */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Release object URLs when the staged set changes or on unmount.
  useEffect(() => {
    return () => {
      for (const s of staged) URL.revokeObjectURL(s.previewUrl);
    };
  }, [staged]);

  function selectStep(step: TrainingStep) {
    if (step.id === activeStep.id) return;
    for (const s of staged) URL.revokeObjectURL(s.previewUrl);
    setStaged([]);
    setActiveStep(step);
    setThankYou(null);
    setError(null);
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: `staged-${stagedSeq++}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    if (incoming.length === 0) return;
    setStaged((prev) => [...prev, ...incoming]);
    setThankYou(null);
    setError(null);
  }

  function removeStaged(id: string) {
    setStaged((prev) => {
      const hit = prev.find((s) => s.id === id);
      if (hit) URL.revokeObjectURL(hit.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
  }

  async function submit() {
    if (staged.length === 0 || uploading) return;
    setUploading(true);
    setError(null);
    setThankYou(null);

    const form = new FormData();
    form.set("step", activeStep.id);
    for (const s of staged) form.append("files", s.file);

    try {
      const res = await fetch("/api/training-images", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && !Array.isArray(data.uploaded)) {
        setError(typeof data.error === "string" ? data.error : "Submission failed.");
        return;
      }

      const okCount = data.uploaded?.length ?? 0;
      const failures: { name: string; reason: string }[] = Array.isArray(data.failed)
        ? data.failed
        : [];

      if (okCount === 0) {
        setError(
          failures.length
            ? failures.map((f) => `${f.name}: ${f.reason}`).join(" · ")
            : "Nothing was submitted. Please try again.",
        );
        return;
      }

      // Success: clear the staging area and thank the tech.
      for (const s of staged) URL.revokeObjectURL(s.previewUrl);
      setStaged([]);
      const praise = typeof data.praise === "string" ? data.praise : "looks amazing!";
      setThankYou(`Thank you for your submission — ${praise}`);
      if (failures.length) {
        setError(
          `${failures.length} skipped · ` +
            failures.map((f) => `${f.name}: ${f.reason}`).join(" · "),
        );
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-10">
      {/* Step tabs */}
      <div className="flex flex-wrap gap-2">
        {TRAINING_STEPS.map((step) => {
          const active = step.id === activeStep.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => selectStep(step)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-rose-900 bg-rose-900 text-cream-50"
                  : "border-cream-300 bg-white text-rose-900 hover:border-rose-300"
              }`}
            >
              <span className="tabular-nums">Step {step.number}</span> · {step.title}
              {step.optional && (
                <span
                  className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                    active ? "bg-cream-50/20 text-cream-50" : "bg-cream-200 text-mauve-600"
                  }`}
                >
                  Optional
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-mauve-600">
        <span className="font-semibold text-rose-900">{activeStep.title}:</span>{" "}
        {activeStep.hint} Review the photos below, remove any that aren’t right, then submit.
      </p>

      {!configured && (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">Cloud storage isn’t connected yet.</p>
          <p className="mt-1">
            Add <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to your
            environment and restart the app. Submissions are disabled until then.
          </p>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`mt-6 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-rose-400 bg-rose-50" : "border-cream-300 bg-white"
        }`}
      >
        <p className="text-rose-900 font-display text-lg font-bold">Drag photos here</p>
        <p className="mt-1 text-sm text-mauve-600">
          JPEG, PNG, HEIC · up to 25 MB each · multiple at a time
        </p>
        <label className="mt-4 inline-flex cursor-pointer rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-rose-900 hover:border-rose-300 transition-colors aria-disabled:opacity-50">
          Choose files
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={!configured}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {thankYou && (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {thankYou}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </p>
      )}

      {/* Staging area — local preview only; nothing is stored until Submit. */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold text-rose-900">
            In “{activeStep.title}”
          </h3>
          {staged.length > 0 && (
            <button
              type="button"
              onClick={submit}
              disabled={uploading || !configured}
              className="inline-flex rounded-full bg-rose-900 px-6 py-2.5 text-sm font-semibold text-cream-50 hover:bg-rose-800 transition-colors disabled:opacity-50"
            >
              {uploading
                ? "Submitting…"
                : `Submit ${staged.length} photo${staged.length === 1 ? "" : "s"}`}
            </button>
          )}
        </div>

        {staged.length === 0 ? (
          <p className="mt-4 text-mauve-600">
            No photos staged yet. Drop the first ones above — they stay here for you to review and
            are only sent when you hit submit.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {staged.map((s) => (
              <li
                key={s.id}
                className="group relative overflow-hidden rounded-xl border border-cream-200 bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.previewUrl}
                  alt={s.file.name}
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeStaged(s.id)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-rose-900/85 px-2 py-0.5 text-xs font-semibold text-cream-50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Remove
                </button>
                <p className="truncate px-2 py-1.5 text-xs text-mauve-600">{s.file.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
