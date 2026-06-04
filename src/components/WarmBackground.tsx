/**
 * Shared warm editorial backdrop, the soft stone/ivory canvas with faint warm
 * radial glows used across the redesigned pages (ai-demo, about, training-data,
 * nail-archive). Drop inside a `relative isolate overflow-hidden` wrapper.
 */
export function WarmBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 -z-10 min-h-full bg-gradient-to-b from-stone-100 via-[#f7f3ec] to-stone-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 min-h-full bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(180,150,110,0.10),transparent_60%),radial-gradient(ellipse_90%_70%_at_0%_100%,rgba(168,162,158,0.10),transparent_52%),radial-gradient(ellipse_80%_60%_at_100%_100%,rgba(180,150,110,0.08),transparent_50%)]"
        aria-hidden
      />
    </>
  );
}
