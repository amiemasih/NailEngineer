"use client";

import { useCallback, useEffect, useState } from "react";
import JSZip from "jszip";
import { TRAINING_STEPS, type TrainingStep } from "@/lib/training-steps";

type StoredImage = {
  name: string;
  path: string;
  url: string | null;
  size: number | null;
  createdAt: string | null;
};

function formatSize(bytes: number | null): string {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function TrainingImageGallery() {
  const [activeStep, setActiveStep] = useState<TrainingStep>(TRAINING_STEPS[0]);
  const [images, setImages] = useState<StoredImage[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const loadImages = useCallback(async (step: TrainingStep) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/tech/training-images?step=${encodeURIComponent(step.id)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not load images.");
        setImages([]);
        return;
      }
      setConfigured(data.configured !== false);
      setImages(Array.isArray(data.images) ? data.images : []);
    } catch {
      setError("Could not reach the server.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages(activeStep);
  }, [activeStep, loadImages]);

  const downloadAll = useCallback(async () => {
    const downloadable = images.filter((img) => img.url);
    if (downloadable.length === 0) return;

    setDownloading(true);
    setDownloadProgress(0);
    setError(null);
    try {
      const zip = new JSZip();
      const used = new Set<string>();
      let done = 0;

      for (const img of downloadable) {
        try {
          const res = await fetch(img.url as string);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          // Guard against duplicate filenames inside the zip.
          let entry = img.name;
          let n = 1;
          while (used.has(entry)) {
            const dot = img.name.lastIndexOf(".");
            entry =
              dot > 0
                ? `${img.name.slice(0, dot)} (${n})${img.name.slice(dot)}`
                : `${img.name} (${n})`;
            n += 1;
          }
          used.add(entry);
          zip.file(entry, blob);
        } catch {
          // Skip an individual image that fails; keep zipping the rest.
        }
        done += 1;
        setDownloadProgress(Math.round((done / downloadable.length) * 100));
      }

      const archive = await zip.generateAsync({ type: "blob" });
      const href = URL.createObjectURL(archive);
      const a = document.createElement("a");
      a.href = href;
      a.download = `nail-engineer-step-${activeStep.number}-${activeStep.id}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch {
      setError("Could not build the zip. Try again.");
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  }, [images, activeStep]);

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
              onClick={() => setActiveStep(step)}
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

      {!configured && (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">Cloud storage isn’t connected yet.</p>
          <p className="mt-1">
            Add <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to your
            environment and restart the app.
          </p>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-rose-900">
            {activeStep.title}
            {!loading && (
              <span className="ml-2 text-base font-semibold text-mauve-600 tabular-nums">
                ({images.length})
              </span>
            )}
          </h2>
          <div className="flex items-center gap-4">
            {!loading && images.some((img) => img.url) && (
              <button
                type="button"
                onClick={downloadAll}
                disabled={downloading}
                className="rounded-full border border-rose-900 bg-rose-900 px-4 py-2 text-sm font-semibold text-cream-50 transition-colors hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloading
                  ? `Zipping… ${downloadProgress}%`
                  : `Download all (${images.filter((img) => img.url).length})`}
              </button>
            )}
            <button
              type="button"
              onClick={() => loadImages(activeStep)}
              className="text-sm font-semibold text-mauve-600 hover:text-rose-900 hover:underline"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-4 text-mauve-600">Loading…</p>
        ) : images.length === 0 ? (
          <p className="mt-4 text-mauve-600">No images submitted to this step yet.</p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img) => (
              <li
                key={img.path}
                className="overflow-hidden rounded-xl border border-cream-200 bg-white"
              >
                {img.url ? (
                  <a href={img.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.name}
                      className="aspect-square w-full object-cover"
                    />
                  </a>
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-cream-100 text-xs text-mauve-600">
                    No preview
                  </div>
                )}
                <div className="px-2 py-1.5">
                  <p className="truncate text-xs text-ink">{img.name}</p>
                  <p className="text-[11px] text-mauve-600">
                    {[formatSize(img.size), formatDate(img.createdAt)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
