type Props = {
  className?: string;
  width?: number;
  height?: number;
  variant?: "default" | "onDark";
};

const SPOKE_DEG = [0, 60, 120, 180, 240, 300] as const;

/**
 * Engineer symbol: minimal cog (hub + six spokes) + nail brush crossing through.
 * Line icon — precision, systems, craft. Same geometry in /public/brand/ and favicon.
 */
export function LogoMark({
  className = "",
  width = 32,
  height = 32,
  variant = "default",
}: Props) {
  const stroke = variant === "onDark" ? "#e4e4e7" : "currentColor";
  const sw = 1.55;
  const cx = 16;
  const cy = 16;
  const inner = 4;
  const outer = 9.75;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cy}
        r={inner}
        stroke={stroke}
        strokeWidth={sw}
      />
      {SPOKE_DEG.map((deg) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return (
          <line
            key={deg}
            x1={cx + inner * c}
            y1={cy + inner * s}
            x2={cx + outer * c}
            y2={cy + outer * s}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        );
      })}
      {/* Brush handle — crosses the gear */}
      <line
        x1="9.25"
        y1="24.25"
        x2="22.75"
        y2="8.25"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* Bristles — short strokes perpendicular to handle */}
      <line
        x1="20.35"
        y1="6.15"
        x2="24.85"
        y2="11.35"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <line
        x1="21.35"
        y1="5.35"
        x2="25.85"
        y2="10.55"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <line
        x1="22.35"
        y1="4.55"
        x2="26.85"
        y2="9.75"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}
