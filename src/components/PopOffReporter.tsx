"use client";

import { useEffect, useState } from "react";
import {
  HandDiagram,
  type FingerId,
  type PopOffSelection,
} from "@/components/HandDiagram";

type StagedPhoto = { id: string; file: File; previewUrl: string };
let seq = 0;

/**
 * "Did a nail pop off?" report. Lives at the bottom of the training-data page
 * and reuses the submitter identity entered above. Submits the hand/finger
 * selection, two dates, notes, and optional photos to /api/pop-off.
 */
export function PopOffReporter({
  submitterName,
  submitterType,
  storageConfigured,
}: {
  submitterName: string;
  submitterType: "school" | "individual";
  storageConfigured: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<PopOffSelection>({
    leftFingers: [],
    rightFingers: [],
  });
  const [nailsDoneDate, setNailsDoneDate] = useState("");
  const [poppedOffDate, setPoppedOffDate] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<StagedPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      for (const p of photos) URL.revokeObjectURL(p.previewUrl);
    };
  }, [photos]);

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: `popoff-${seq++}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    if (incoming.length) setPhotos((prev) => [...prev, ...incoming]);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const hit = prev.find((p) => p.id === id);
      if (hit) URL.revokeObjectURL(hit.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  const fingerCount = sel.leftFingers.length + sel.rightFingers.length;

  async function submit() {
    if (submitting) return;
    setError(null);
    setDone(null);
    if (!submitterName.trim()) {
      setError("Enter your nail school or tech/salon name above first.");
      return;
    }
    if (fingerCount === 0) {
      setError("Tap at least one nail that popped off.");
      return;
    }

    setSubmitting(true);
    const form = new FormData();
    form.set("submitterName", submitterName.trim());
    form.set("submitterType", submitterType);
    form.set("leftFingers", JSON.stringify(sel.leftFingers as FingerId[]));
    form.set("rightFingers", JSON.stringify(sel.rightFingers as FingerId[]));
    if (nailsDoneDate) form.set("nailsDoneDate", nailsDoneDate);
    if (poppedOffDate) form.set("poppedOffDate", poppedOffDate);
    if (notes.trim()) form.set("notes", notes.trim());
    for (const p of photos) form.append("files", p.file);

    try {
      const res = await fetch("/api/pop-off", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not send.");
        return;
      }
      // Reset on success.
      for (const p of photos) URL.revokeObjectURL(p.previewUrl);
      setPhotos([]);
      setSel({ leftFingers: [], rightFingers: [] });
      setNailsDoneDate("");
      setPoppedOffDate("");
      setNotes("");
      setDone("Thank you, your pop-off report was sent.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-12 rounded-sm border border-stone-200 bg-[#fdfbf7] p-6 shadow-[0_18px_45px_-24px_rgba(68,64,60,0.5)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-stone-900">
            Did a nail pop off?
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            Tell us which nails lifted and when, it helps the model learn what
            lasts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 hover:border-amber-300"
        >
          {open ? "Close" : "Report a pop-off"}
        </button>
      </div>

      {open && (
        <div className="mt-6 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Pick a hand, then tap the nails that popped off
            </p>
            <div className="mt-3">
              <HandDiagram onChange={setSel} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                When did you do the nails?
              </label>
              <input
                type="date"
                value={nailsDoneDate}
                onChange={(e) => setNailsDoneDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                When did they pop off?
              </label>
              <input
                type="date"
                value={poppedOffDate}
                onChange={(e) => setPoppedOffDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anything else, product used, what you noticed…"
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Photos of the popped nail (optional)
            </label>
            <label className="mt-2 inline-flex cursor-pointer rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 hover:border-amber-300 aria-disabled:opacity-50">
              Add photos
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                disabled={!storageConfigured}
                onChange={(e) => {
                  addPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            {!storageConfigured && (
              <p className="mt-1 text-xs text-amber-700">
                Cloud storage isn&apos;t connected, photos are disabled, but you
                can still send the report.
              </p>
            )}
            {photos.length > 0 && (
              <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {photos.map((p) => (
                  <li
                    key={p.id}
                    className="group relative overflow-hidden rounded-sm border border-stone-200 bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.previewUrl}
                      alt={p.file.name}
                      className="aspect-square w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(p.id)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-stone-900/85 px-2 py-0.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {done && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {done}
            </p>
          )}
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
          >
            {submitting
              ? "Sending…"
              : `Send report${fingerCount ? ` (${fingerCount} nail${fingerCount === 1 ? "" : "s"})` : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
