"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_SAMPLES, type DemoSample, type NailVariant } from "@/lib/ai-demo-samples";

type Phase = "uploading" | "analyzing" | "done";

/** A drawn nail "photo" — no external assets, so the demo always renders. */
function NailPhoto({ variant }: { variant: NailVariant }) {
  return (
    <svg viewBox="0 0 200 240" className="h-full w-full" role="img" aria-label="Sample nail photo">
      <defs>
        <linearGradient id="ne-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3d6bf" />
          <stop offset="1" stopColor="#d6a586" />
        </linearGradient>
        <linearGradient id="ne-plate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcefe9" />
          <stop offset="1" stopColor="#eecabb" />
        </linearGradient>
      </defs>

      {/* finger */}
      <rect x="50" y="18" width="100" height="214" rx="50" fill="url(#ne-skin)" />
      {/* knuckle shading */}
      <ellipse cx="100" cy="206" rx="44" ry="22" fill="#c08f6f" opacity="0.3" />

      {/* nail plate */}
      <rect x="68" y="46" width="64" height="108" rx="30" fill="url(#ne-plate)" />
      {/* tip shine */}
      <ellipse cx="86" cy="70" rx="7" ry="18" fill="#ffffff" opacity="0.3" />
      {/* cuticle line */}
      <path d="M70 150 Q100 162 130 150" stroke="#c79b81" strokeWidth="4" fill="none" opacity="0.5" />

      {variant === "chipped-gel" && (
        <>
          {/* red gel, leaving a bare regrowth crescent near the cuticle */}
          <rect x="70" y="50" width="60" height="84" rx="26" fill="#b91c1c" />
          <rect x="70" y="50" width="60" height="84" rx="26" fill="#7f1313" opacity="0.25" />
          {/* chips at the free edge */}
          <path d="M98 50 l11 8 l-11 8 z" fill="url(#ne-plate)" />
          <path d="M122 64 l8 7 l-9 5 z" fill="url(#ne-plate)" />
          {/* gloss streak */}
          <rect x="84" y="58" width="6" height="60" rx="3" fill="#ffffff" opacity="0.25" />
        </>
      )}

      {variant === "cuticles-pushed" && (
        <>
          {/* clean pushed-back crescent */}
          <path d="M72 150 Q100 138 128 150" stroke="#ffffff" strokeWidth="5" fill="none" opacity="0.85" />
          {/* a fleck of loose skin still on the plate */}
          <ellipse cx="108" cy="142" rx="6" ry="3" fill="#e7b89d" opacity="0.8" />
        </>
      )}
    </svg>
  );
}

function ScanOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div className="ne-scan-line absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-rose-400 to-transparent shadow-[0_0_18px_4px_rgba(244,114,182,0.55)]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(244,114,182,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(244,114,182,0.25) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
    </div>
  );
}

export function AiDemo() {
  const [active, setActive] = useState<DemoSample>(DEMO_SAMPLES[0]);
  const [phase, setPhase] = useState<Phase>("uploading");
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const run = useCallback(
    (sample: DemoSample) => {
      clearTimers();
      setActive(sample);
      setPhase("uploading");
      setProgress(0);

      const steps = [16, 41, 67, 88, 100];
      steps.forEach((p, i) => {
        timers.current.push(
          setTimeout(() => {
            setProgress(p);
            if (p === 100) {
              timers.current.push(setTimeout(() => setPhase("analyzing"), 260));
              timers.current.push(setTimeout(() => setPhase("done"), 260 + 1700));
            }
          }, 200 * (i + 1)),
        );
      });
    },
    [clearTimers],
  );

  useEffect(() => {
    run(DEMO_SAMPLES[0]);
    return clearTimers;
  }, [run, clearTimers]);

  const a = active.analysis;

  return (
    <div className="mt-10">
      <style>{`
        @keyframes neScan { 0% { top: 2%; } 100% { top: 98%; } }
        @keyframes neFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .ne-scan-line { animation: neScan 1.5s ease-in-out infinite alternate; }
        .ne-fade { animation: neFade 0.45s ease both; }
      `}</style>

      {/* sample picker */}
      <div className="flex flex-wrap gap-2">
        {DEMO_SAMPLES.map((s) => {
          const isActive = s.id === active.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => run(s)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-rose-900 bg-rose-900 text-cream-50"
                  : "border-cream-300 bg-white text-rose-900 hover:border-rose-300"
              }`}
            >
              <span className="h-7 w-7 overflow-hidden rounded-full border border-cream-200 bg-cream-50">
                <NailPhoto variant={s.variant} />
              </span>
              {s.caption}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* photo + scan */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-cream-200 bg-gradient-to-br from-cream-100 to-cream-50">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <NailPhoto variant={active.variant} />
            </div>

            {phase === "analyzing" && <ScanOverlay />}

            {/* filename chip */}
            <span className="absolute left-3 top-3 rounded-full bg-rose-950/80 px-3 py-1 text-xs font-medium text-cream-50">
              {active.filename}
            </span>

            {/* status chip */}
            <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-rose-900">
              {phase === "uploading"
                ? `Uploading ${progress}%`
                : phase === "analyzing"
                  ? "Analyzing…"
                  : "Analyzed"}
            </span>

            {/* upload progress bar */}
            {phase === "uploading" && (
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-rose-950/10">
                <div
                  className="h-full bg-rose-500 transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => run(active)}
            className="mt-3 inline-flex w-full justify-center rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-rose-900 transition-colors hover:border-rose-300"
          >
            ↻ Re-run analysis
          </button>
        </div>

        {/* feedback */}
        <div className="rounded-2xl border border-cream-200 bg-white p-6">
          {phase !== "done" ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-rose-300 [animation-delay:-0.2s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-rose-400 [animation-delay:-0.1s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-rose-500" />
              </div>
              <p className="mt-4 text-sm font-medium text-mauve-600">
                {phase === "uploading"
                  ? "Sending your photo securely…"
                  : "Reading the nail and matching it to a service stage…"}
              </p>
            </div>
          ) : (
            <div className="ne-fade" key={active.id}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-rose-900 px-3 py-1 text-xs font-semibold text-cream-50">
                  Detected · Step {a.stageNumber}: {a.stageTitle}
                </span>
                <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold text-rose-900">
                  {a.confidence}% confidence
                </span>
              </div>

              {/* confidence meter */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
                  style={{ width: `${a.confidence}%` }}
                />
              </div>

              <p className="mt-4 text-rose-900">
                <span className="font-semibold">Assessment: </span>
                {a.condition}
              </p>

              <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-gold-600">
                What the AI sees
              </h3>
              <ul className="mt-2 space-y-1.5">
                {a.observations.map((o) => (
                  <li key={o} className="flex gap-2 text-sm text-mauve-700">
                    <span aria-hidden className="mt-0.5 text-rose-400">
                      ✓
                    </span>
                    {o}
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                  Recommended next step
                </p>
                <p className="mt-1 font-display text-lg font-bold text-rose-900">
                  Step {a.nextStepNumber}: {a.nextStepTitle}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-rose-900/90">{a.advice}</p>
              </div>

              {a.tip && (
                <p className="mt-3 text-sm text-mauve-600">
                  <span className="font-semibold text-rose-900">Pro tip: </span>
                  {a.tip}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-mauve-500">
        Demo only. Sample photos are illustrations and the feedback is scripted to show how the
        finished assistant will guide each step.
      </p>
    </div>
  );
}
