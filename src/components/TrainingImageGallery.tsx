"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

export function TrainingImageGallery({
  filterPaths = null,
  filterLabel = null,
}: {
  /** When set, only images whose storage path is in this list are shown. */
  filterPaths?: string[] | null;
  /** Name of the person the gallery is filtered to (for empty-state copy). */
  filterLabel?: string | null;
} = {}) {
  const [activeStep, setActiveStep] = useState<TrainingStep>(TRAINING_STEPS[0]);
  const [images, setImages] = useState<StoredImage[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const filterSet = useMemo(
    () => (filterPaths ? new Set(filterPaths) : null),
    [filterPaths],
  );
  const visible = useMemo(
    () => (filterSet ? images.filter((img) => filterSet.has(img.path)) : images),
    [images, filterSet],
  );

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
    const downloadable = visible.filter((img) => img.url);
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
  }, [visible, activeStep]);

  return (
    <div className="mt-14">
      {filterLabel && (
        <p className="mb-5 text-sm text-stone-600">
          Showing only photos submitted by{" "}
          <span className="font-semibold text-stone-900">{filterLabel}</span>.
        </p>
      )}

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
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-amber-300"
              }`}
            >
              <span className="tabular-nums">Step {step.number}</span> · {step.title}
              {step.optional && (
                <span
                  className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                    active ? "bg-white/20 text-white" : "bg-stone-200 text-stone-500"
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
        <div className="mt-6 rounded-sm border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">Cloud storage isn’t connected yet.</p>
          <p className="mt-1">
            Add <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to your
            environment and restart the app.
          </p>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-normal tracking-tight text-stone-900">
            {activeStep.title}
            {!loading && (
              <span className="ml-2 text-base font-semibold text-stone-500 tabular-nums">
                ({visible.length})
              </span>
            )}
          </h2>
          <div className="flex items-center gap-4">
            {!loading && visible.some((img) => img.url) && (
              <button
                type="button"
                onClick={downloadAll}
                disabled={downloading}
                className="rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloading
                  ? `Zipping… ${downloadProgress}%`
                  : `Download all (${visible.filter((img) => img.url).length})`}
              </button>
            )}
            <button
              type="button"
              onClick={() => loadImages(activeStep)}
              className="text-sm font-semibold text-stone-500 hover:text-amber-800 hover:underline"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-4 text-stone-500">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="mt-4 text-stone-500">
            {filterLabel
              ? `No images from ${filterLabel} in this step.`
              : "No images submitted to this step yet."}
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {visible.map((img) => (
              <li
                key={img.path}
                className="overflow-hidden rounded-sm border border-stone-200 bg-white"
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
                  <div className="flex aspect-square w-full items-center justify-center bg-stone-100 text-xs text-stone-500">
                    No preview
                  </div>
                )}
                <div className="px-2 py-1.5">
                  <p className="truncate text-xs text-stone-700">{img.name}</p>
                  <p className="text-[11px] text-stone-500">
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
