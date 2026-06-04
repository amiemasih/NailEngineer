"use client";

import { useState } from "react";

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

/**
 * Finger geometry for a right hand drawn palm-up, fingers pointing up.
 * Each finger is a rounded stem with a nail target near its tip. The left
 * hand reuses this geometry, mirrored horizontally.
 */
const FINGERS: Record<
  FingerId,
  { x: number; w: number; top: number; nailY: number; rot?: number }
> = {
  pinky: { x: 26, w: 26, top: 74, nailY: 84 },
  ring: { x: 58, w: 28, top: 46, nailY: 56 },
  middle: { x: 92, w: 28, top: 34, nailY: 44 },
  index: { x: 126, w: 28, top: 58, nailY: 68 },
  thumb: { x: 158, w: 28, top: 132, nailY: 150, rot: 38 },
};

const PALM_TOP = 150;

function HandSvg({
  hand,
  active,
  selected,
  onToggleFinger,
  onActivate,
}: {
  hand: Hand;
  active: boolean;
  selected: FingerId[];
  onToggleFinger: (f: FingerId) => void;
  onActivate: () => void;
}) {
  // Draw the right hand; mirror for the left so both palms face the viewer.
  const mirror = hand === "left";
  const stemFill = active ? "#fdf6ec" : "#f5f5f4"; // warm ivory vs stone-100
  const stemStroke = active ? "#d8c39a" : "#d6d3d1";

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onActivate}
        aria-pressed={active}
        className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
          active
            ? "border-stone-900 bg-stone-900 text-white"
            : "border-stone-300 bg-white text-stone-500 hover:border-amber-300"
        }`}
      >
        {hand === "left" ? "Left hand" : "Right hand"}
      </button>

      <svg
        viewBox="0 0 212 260"
        className={`h-56 w-auto transition-opacity ${
          active ? "opacity-100" : "opacity-40"
        }`}
        role="group"
        aria-label={`${hand} hand`}
      >
        <g transform={mirror ? "translate(212,0) scale(-1,1)" : undefined}>
          {/* Palm */}
          <rect
            x={24}
            y={PALM_TOP}
            width={158}
            height={96}
            rx={34}
            fill={stemFill}
            stroke={stemStroke}
            strokeWidth={2}
          />
          {/* Fingers + nails */}
          {FINGER_IDS.map((id) => {
            const f = FINGERS[id];
            const on = selected.includes(id);
            const cx = f.x + f.w / 2;
            const transform = f.rot
              ? `rotate(${f.rot} ${cx} ${f.nailY})`
              : undefined;
            return (
              <g key={id} transform={transform}>
                {/* finger stem */}
                <rect
                  x={f.x}
                  y={f.top}
                  width={f.w}
                  height={PALM_TOP - f.top + 30}
                  rx={f.w / 2}
                  fill={stemFill}
                  stroke={stemStroke}
                  strokeWidth={2}
                />
                {/* nail target, clickable */}
                <ellipse
                  cx={cx}
                  cy={f.nailY}
                  rx={f.w / 2 - 4}
                  ry={13}
                  fill={on ? "#b45309" : "#ffffff"}
                  stroke={on ? "#b45309" : active ? "#d8c39a" : "#d6d3d1"}
                  strokeWidth={2}
                  className={active ? "cursor-pointer" : "cursor-default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (active) onToggleFinger(id);
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {selected.length > 0 && (
        <p className="text-xs font-medium text-stone-700">
          {selected.map((f) => FINGER_LABEL[f]).join(", ")}
        </p>
      )}
    </div>
  );
}

/**
 * Interactive left/right hand diagram. Click a hand to make it active (the
 * other greys out), then tap the nails that popped off. Both hands' selections
 * are retained and reported via `onChange`.
 */
export function HandDiagram({
  onChange,
}: {
  onChange: (sel: PopOffSelection) => void;
}) {
  const [active, setActive] = useState<Hand>("left");
  const [left, setLeft] = useState<FingerId[]>([]);
  const [right, setRight] = useState<FingerId[]>([]);

  function toggle(hand: Hand, finger: FingerId) {
    const cur = hand === "left" ? left : right;
    const next = cur.includes(finger)
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
    <div className="grid gap-6 sm:grid-cols-2">
      <HandSvg
        hand="left"
        active={active === "left"}
        selected={left}
        onActivate={() => setActive("left")}
        onToggleFinger={(f) => toggle("left", f)}
      />
      <HandSvg
        hand="right"
        active={active === "right"}
        selected={right}
        onActivate={() => setActive("right")}
        onToggleFinger={(f) => toggle("right", f)}
      />
    </div>
  );
}
