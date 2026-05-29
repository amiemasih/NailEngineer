"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

export function TrainingImageUploader() {
  const [activeStep, setActiveStep] = useState<TrainingStep>(TRAINING_STEPS[0]);
  const [queued, setQueued] = useState<File[]>([]);
  const [images, setImages] = useState<StoredImage[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImages = useCallback(async (step: TrainingStep) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/training-images?step=${encodeURIComponent(step.id)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not load images.");
        return;
      }
      setConfigured(data.configured !== false);
      setImages(Array.isArray(data.images) ? data.images : []);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages(activeStep);
  }, [activeStep, loadImages]);

  function selectStep(step: TrainingStep) {
    if (step.id === activeStep.id) return;
    setActiveStep(step);
    setQueued([]);
    setMessage(null);
    setError(null);
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (incoming.length === 0) return;
    setQueued((prev) => [...prev, ...incoming]);
    setMessage(null);
  }

  function removeQueued(index: number) {
    setQueued((prev) => prev.filter((_, i) => i !== index));
  }

  async function upload() {
    if (queued.length === 0 || uploading) return;
    setUploading(true);
    setError(null);
    setMessage(null);

    const form = new FormData();
    form.set("step", activeStep.id);
    for (const file of queued) form.append("files", file);

    try {
      const res = await fetch("/api/training-images", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && !Array.isArray(data.uploaded)) {
        setError(typeof data.error === "string" ? data.error : "Upload failed.");
        return;
      }
      const okCount = data.uploaded?.length ?? 0;
      const failCount = data.failed?.length ?? 0;
      setMessage(
        `Uploaded ${okCount} image${okCount === 1 ? "" : "s"} to “${activeStep.title}”` +
          (failCount ? ` · ${failCount} skipped` : ""),
      );
      if (failCount) {
        setError(
          data.failed
            .map((f: { name: string; reason: string }) => `${f.name}: ${f.reason}`)
            .join(" · "),
        );
      }
      setQueued([]);
      if (inputRef.current) inputRef.current.value = "";
      await loadImages(activeStep);
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
        {activeStep.hint} Images save to the{" "}
        <code className="rounded bg-cream-200 px-1.5 py-0.5 text-xs text-rose-900">
          {activeStep.folder}/
        </code>{" "}
        folder.
      </p>

      {!configured && (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">Cloud storage isn’t connected yet.</p>
          <p className="mt-1">
            Add <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to your
            environment and restart the app. Uploads are disabled until then.
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
        <p className="text-rose-900 font-display text-lg font-bold">
          Drag photos here
        </p>
        <p className="mt-1 text-sm text-mauve-600">
          JPEG, PNG, HEIC · up to 25 MB each · multiple at a time
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!configured}
          className="mt-4 inline-flex rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-rose-900 hover:border-rose-300 transition-colors disabled:opacity-50"
        >
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Queue */}
      {queued.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-rose-900">
              Ready to upload ({queued.length})
            </h3>
            <button
              type="button"
              onClick={upload}
              disabled={uploading || !configured}
              className="inline-flex rounded-full bg-rose-900 px-6 py-2.5 text-sm font-semibold text-cream-50 hover:bg-rose-800 transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading…" : `Upload to “${activeStep.title}”`}
            </button>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {queued.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="group relative overflow-hidden rounded-xl border border-cream-200 bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="aspect-square w-full object-cover"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
                <button
                  type="button"
                  onClick={() => removeQueued(i)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-rose-900/85 px-2 py-0.5 text-xs font-semibold text-cream-50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Remove
                </button>
                <p className="truncate px-2 py-1.5 text-xs text-mauve-600">{file.name}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </p>
      )}

      {/* Existing gallery */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold text-rose-900">
            In “{activeStep.title}”
          </h3>
          <button
            type="button"
            onClick={() => loadImages(activeStep)}
            className="text-sm font-semibold text-mauve-600 hover:text-rose-900 hover:underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-mauve-600">Loading…</p>
        ) : images.length === 0 ? (
          <p className="mt-4 text-mauve-600">
            No images in this step yet. Drop the first ones above.
          </p>
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
                  {img.size != null && (
                    <p className="text-[11px] text-mauve-600">{formatSize(img.size)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
