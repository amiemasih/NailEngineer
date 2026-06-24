"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PREP_REPORT,
  retentionTone,
  statusTone,
  type FingerFinding,
  type ReportStage,
  type Tone,
} from "@/lib/ai-demo-report";

type Phase = "uploading" | "analyzing" | "done";

const STAGE_PHOTOS = [
  "/ai-demo/stage-before.jpg",
  "/ai-demo/stage-push-back.jpg",
  "/ai-demo/stage-clean.jpg",
  "/ai-demo/stage-trim-buff.jpg",
];

const TONE_CHIP: Record<Tone, string> = {
  good: "bg-green-100 text-green-800",
  warn: "bg-amber-100/80 text-amber-800",
  bad: "bg-red-100 text-red-800",
};

/** Red (low) -> amber -> green (high) for the prep-score meter. */
function scoreTone(c: number): string {
  if (c >= 80) return "bg-green-600/90";
  if (c >= 60) return "bg-amber-400/80";
  return "bg-red-600/90";
}

function ScanOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div className="ne-scan-line absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-amber-300/50 to-transparent shadow-[0_0_16px_3px_rgba(214,178,110,0.25)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(180,150,90,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(180,150,90,0.15) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
    </div>
  );
}

function ToneChip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CHIP[tone]}`}>
      {children}
    </span>
  );
}

function FingerCard({ f }: { f: FingerFinding }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-white/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-stone-900">{f.finger}</span>
        <ToneChip tone={statusTone(f.status)}>{f.status}</ToneChip>
      </div>
      <dl className="mt-2.5 space-y-1.5 text-sm">
        {f.issues && (
          <Row label="Issues Found" value={f.issues} valueClass="text-stone-800" />
        )}
        {f.observation && (
          <Row label="Observation" value={f.observation} valueClass="text-stone-700" />
        )}
        {f.cause && <Row label="Cause" value={f.cause} valueClass="text-stone-600" />}
        {f.fix && <Row label="How to Fix" value={f.fix} valueClass="text-stone-800" />}
      </dl>
      {f.retention && (
        <div className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-2.5">
          <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {f.retention.label}
          </span>
          <ToneChip tone={retentionTone(f.retention.value)}>{f.retention.value}</ToneChip>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</dt>
      <dd className={valueClass}>{value}</dd>
    </div>
  );
}

function StageSection({ stage }: { stage: ReportStage }) {
  return (
    <section className="mt-8 border-t border-stone-200 pt-8">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-2xl font-normal tracking-tight text-stone-900">
          Stage {stage.number}: {stage.title}
        </h3>
        {stage.overallStatus && (
          <ToneChip tone={statusTone(stage.overallStatus)}>{stage.overallStatus}</ToneChip>
        )}
      </div>
      {stage.overallResult && (
        <p className="mt-1.5 text-sm text-stone-600">{stage.overallResult}</p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,300px)_1fr]">
        {stage.photo && (
          <div className="self-start overflow-hidden rounded-sm border border-stone-200 bg-[#fbf8f3] shadow-[0_18px_45px_-22px_rgba(68,64,60,0.5)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stage.photo}
              alt={`Stage ${stage.number}: ${stage.title}`}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {stage.fingers.map((f) => (
            <FingerCard key={f.finger} f={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AiDemo() {
  const report = PREP_REPORT;
  const [phase, setPhase] = useState<Phase>("uploading");
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const run = useCallback(() => {
    clearTimers();
    setPhase("uploading");
    setProgress(0);

    const steps = [16, 41, 67, 88, 100];
    steps.forEach((p, i) => {
      timers.current.push(
        setTimeout(() => {
          setProgress(p);
          if (p === 100) {
            timers.current.push(setTimeout(() => setPhase("analyzing"), 260));
            timers.current.push(setTimeout(() => setPhase("done"), 260 + 1900));
          }
        }, 200 * (i + 1)),
      );
    });
  }, [clearTimers]);

  useEffect(() => {
    run();
    return clearTimers;
  }, [run, clearTimers]);

  return (
    <div className="mt-10">
      <style>{`
        @keyframes neScan { 0% { top: 2%; } 100% { top: 98%; } }
        @keyframes neFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .ne-scan-line { animation: neScan 1.5s ease-in-out infinite alternate; }
        .ne-fade { animation: neFade 0.5s ease both; }
      `}</style>

      {phase !== "done" ? (
        /* Uploading / analyzing the five stage photos */
        <div className="rounded-sm border border-stone-200 bg-[#fdfbf7] p-6 shadow-[0_18px_45px_-22px_rgba(68,64,60,0.5)]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STAGE_PHOTOS.map((src, i) => (
              <div
                key={src}
                className="relative aspect-[4/5] overflow-hidden rounded-sm border border-stone-200 bg-[#fbf8f3]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Prep photo" className="h-full w-full object-cover" />
                {phase === "analyzing" && <ScanOverlay />}
                {phase === "uploading" && (
                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-stone-900/10">
                    <div
                      className="h-full bg-amber-400/60 transition-all duration-200 ease-out"
                      style={{ width: `${Math.max(0, progress - i * 4)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-stone-600">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-300/55 [animation-delay:-0.2s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-300/65 [animation-delay:-0.1s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-400/65" />
            </span>
            {phase === "uploading"
              ? `Uploading your stage photos… ${progress}%`
              : "Reading each nail and grading the prep, finger by finger…"}
          </div>
        </div>
      ) : (
        <div className="ne-fade rounded-sm border border-stone-200 bg-[#fdfbf7] p-6 shadow-[0_18px_45px_-22px_rgba(68,64,60,0.5)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700/60">
            Nail Engineer · Sample analysis
          </p>
          <h2 className="mt-2 font-display text-3xl font-normal tracking-tight text-stone-900">
            Nail Prep Feedback Report
          </h2>

          {/* Overall results */}
          <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,260px)_1fr]">
            <div className="rounded-sm border border-stone-200 bg-white/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Prep Score
              </p>
              <p className="mt-1 font-display text-4xl font-bold tabular-nums text-stone-900">
                {report.prepScore}
                <span className="text-xl text-stone-400">/100</span>
              </p>
              {/* score meter */}
              <div className="relative mt-4 pt-6">
                <div
                  className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                  style={{ left: `${report.prepScore}%` }}
                >
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white ${scoreTone(report.prepScore)}`}
                  >
                    {report.prepScore}
                  </span>
                  <span className="h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-stone-900" />
                </div>
                <div
                  className="h-2.5 w-full rounded-full"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #dc2626 0%, #f59e0b 55%, #16a34a 100%)",
                  }}
                />
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                <p className="text-stone-700">
                  <span className="font-semibold text-stone-900">Estimated retention: </span>
                  {report.estimatedRetention}
                </p>
                <p className="text-stone-700">
                  <span className="font-semibold text-stone-900">Status: </span>
                  {report.overallStatus}
                </p>
              </div>
            </div>

            <div className="rounded-sm border border-amber-300/45 bg-amber-100/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/70">
                Top issues found
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {report.topIssues.map((issue) => (
                  <li key={issue} className="flex gap-2 text-sm text-stone-800">
                    <span aria-hidden className="mt-0.5 text-amber-500/70">
                      !
                    </span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Per-stage, per-finger breakdown */}
          {report.stages.map((stage) => (
            <StageSection key={stage.number} stage={stage} />
          ))}

          {/* Final recommendation */}
          <section className="mt-8 border-t border-stone-200 pt-8">
            <h3 className="font-display text-2xl font-normal tracking-tight text-stone-900">
              Final recommendation
            </h3>
            <p className="mt-1.5 text-sm text-stone-600">
              Before applying product, complete these final touch-ups:
            </p>
            <ul className="mt-4 space-y-2.5">
              {report.finalRecommendation.map((rec) => (
                <li key={rec} className="flex gap-2.5 text-stone-800">
                  <span aria-hidden className="mt-0.5 text-green-600">
                    ✓
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-sm border border-amber-300/45 bg-amber-100/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/70">
                Expected result
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
                {report.expectedResult}
              </p>
            </div>
          </section>

          <button
            type="button"
            onClick={run}
            className="mt-8 inline-flex justify-center rounded-full border border-stone-300 bg-white/70 px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-amber-400 hover:text-stone-900"
          >
            ↻ Re-run analysis
          </button>
        </div>
      )}
    </div>
  );
}
