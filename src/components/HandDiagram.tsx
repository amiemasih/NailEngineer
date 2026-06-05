"use client";

import { useEffect, useState } from "react";

export const FINGER_IDS = ["thumb", "index", "middle", "ring", "pinky"] as const;
export type FingerId = (typeof FINGER_IDS)[number];
export type Hand = "left" | "right";

export type PopOffSelection = {
  leftFingers: FingerId[];
  rightFingers: FingerId[];
};

const FINGER_LABEL: Record<FingerId, string> = {
  thumb: "Thumb",
  index: "Index",
  middle: "Middle",
  ring: "Ring",
  pinky: "Pinky",
};

// Nail centres as a percentage of the hand image (the back of a LEFT hand,
// thumb on the right). The right hand reuses the same image mirrored, so its
// hotspots are flipped horizontally (x -> 100 - x).
const NAILS: Record<FingerId, { x: number; y: number }> = {
  pinky: { x: 12.5, y: 28.5 },
  ring: { x: 31.8, y: 17.2 },
  middle: { x: 46, y: 11.5 },
  index: { x: 67.6, y: 18.4 },
  thumb: { x: 85.6, y: 52.7 },
};

// A short synthesized bubble "pop" played when a nail is tapped (no audio asset
// needed): a band-passed noise click for the transient plus a fast UPWARD pitch
// blip. A downward sweep sounds like a thud, an upward one pops. Lazily creates
// an AudioContext on first user gesture.
let audioCtx: AudioContext | null = null;
function playPop() {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioCtx ??= new Ctor();
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;

    // 1) Sharp transient: a very short noise burst through a resonant bandpass.
    const noiseLen = Math.floor(ctx.sampleRate * 0.03);
    const buffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen) ** 2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 950;
    bp.Q.value = 7;
    const ng = ctx.createGain();
    ng.gain.value = 0.5;
    noise.connect(bp).connect(ng).connect(ctx.destination);
    noise.start(now);

    // 2) Tonal "bloop": quick rising sine with a snappy decay.
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.55, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // Audio is a nice-to-have; never let it break the toggle.
  }
}

function HandImage({
  hand,
  selected,
  onToggle,
  showHint = false,
}: {
  hand: Hand;
  selected: FingerId[];
  onToggle: (f: FingerId) => void;
  /** Show the one-time "tap here" demo on the pinky until the user interacts. */
  showHint?: boolean;
}) {
  const mirror = hand === "right";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-full max-w-[230px]"
        style={{ aspectRatio: "806 / 1074" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hands/hand.png"
          alt={`${hand} hand`}
          className={`h-full w-full object-contain ${mirror ? "-scale-x-100" : ""}`}
          draggable={false}
        />
        {FINGER_IDS.map((id) => {
          const n = NAILS[id];
          const left = mirror ? 100 - n.x : n.x;
          const on = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                playPop();
                onToggle(id);
              }}
              aria-pressed={on}
              aria-label={`${FINGER_LABEL[id]} nail`}
              style={{ left: `${left}%`, top: `${n.y}%` }}
              className="absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center"
            >
              {showHint && id === "pinky" && (
                <>
                  <span className="pointer-events-none absolute inline-flex h-7 w-7 animate-ping rounded-full bg-amber-400/60" />
                  {/* Flashing arrow pointing up at the pinky nail */}
                  <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute left-1/2 top-full mt-0.5 h-7 w-7 -translate-x-1/2 animate-bounce text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M12 5v14M12 5l-6 6M12 5l6 6" />
                  </svg>
                </>
              )}
              <span
                className={`block h-5 w-5 rounded-full border-2 transition-all ${
                  on
                    ? "border-amber-600 bg-amber-500/30 scale-110"
                    : "border-amber-700/40 bg-transparent hover:border-amber-600 hover:bg-amber-300/20"
                }`}
              />
            </button>
          );
        })}
      </div>
      <p className="text-sm font-semibold text-stone-700">
        {hand === "left" ? "Left hand" : "Right hand"}
      </p>
      {selected.length > 0 && (
        <p className="text-xs font-medium text-amber-800">
          {selected.map((f) => FINGER_LABEL[f]).join(", ")}
        </p>
      )}
    </div>
  );
}

/**
 * Interactive left/right hand diagram. Both hands are always active: tap the
 * dot on any nail to toggle whether it popped off. Selections are reported via
 * `onChange`.
 */
export function HandDiagram({
  onChange,
}: {
  onChange: (sel: PopOffSelection) => void;
}) {
  const [left, setLeft] = useState<FingerId[]>([]);
  const [right, setRight] = useState<FingerId[]>([]);
  // First-visit onboarding only: show the how-to hint the first time someone
  // visits, remembered in localStorage so returning visitors never see it.
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("ne_popoff_onboarded")) {
        setShowOnboarding(true);
        localStorage.setItem("ne_popoff_onboarded", "1");
      }
    } catch {
      // Ignore storage errors (private mode, etc.).
    }
  }, []);

  const totalSelected = left.length + right.length;
  const stageOne = showOnboarding && totalSelected === 0;

  function toggle(hand: Hand, finger: FingerId) {
    const cur = hand === "left" ? left : right;
    const isUndo = cur.includes(finger);
    // Completing the demo: they tapped a nail on, then tapped again to undo.
    if (isUndo) setShowOnboarding(false);
    const next = isUndo
      ? cur.filter((f) => f !== finger)
      : [...cur, finger];
    if (hand === "left") setLeft(next);
    else setRight(next);
    onChange({
      leftFingers: hand === "left" ? next : left,
      rightFingers: hand === "right" ? next : right,
    });
  }

  return (
    <div>
      {showOnboarding && (
        <p className="mb-5 text-center text-sm font-medium text-amber-600">
          {stageOne
            ? "Example: Tap the circle on the left hand's pinky nail to report that it popped off."
            : "Tap it again to undo."}
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <HandImage
          hand="left"
          selected={left}
          onToggle={(f) => toggle("left", f)}
          showHint={stageOne}
        />
        <HandImage
          hand="right"
          selected={right}
          onToggle={(f) => toggle("right", f)}
        />
      </div>
    </div>
  );
}
