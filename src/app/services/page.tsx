import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";
import { formatServicePrice, PRICE_BOOK_UPDATED, servicesByCategory } from "@/lib/services-catalog";
import { getActivePromotions, getFeaturedPromotions } from "@/lib/promotions";
import { activePromotionsForService } from "@/lib/promotion-utils";

export const metadata: Metadata = {
  title: "Services & Pricing — Nail Engineer",
  description:
    "Nail services with clear base pricing, ranges for custom art, and live promotions including student and event offers.",
};

export default function ServicesPage() {
  const now = new Date();
  const activePromos = getActivePromotions(now);
  const featuredPromos = getFeaturedPromotions(now);
  const categories = [...servicesByCategory().entries()];

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20">
        <h1 className={PAGE_TITLE_CLASS}>Services &amp; Pricing</h1>
        <p className="mt-4 max-w-3xl text-lg text-mauve-600 leading-relaxed">
          Base prices for standard work, ranges when design time varies, and a separate lane for
          active discounts so you always know what applies before you book.
        </p>
      </div>

      {featuredPromos.length > 0 ? (
        <div className="mx-auto max-w-6xl px-4 mt-8 sm:px-6 space-y-3">
          {featuredPromos.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border-2 border-zinc-400 bg-gradient-to-r from-cream-100 via-white to-cream-100 px-5 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Featured offer
                </p>
                <p className="mt-1 font-display text-lg font-bold text-rose-900">{p.title}</p>
                <p className="text-sm text-mauve-600 mt-1">
                  <span className="font-semibold text-rose-900">{p.offerLabel}</span>
                  <span className="mx-2 text-cream-300">·</span>
                  {p.eligibility}
                </p>
              </div>
              <Link
                href="/book"
                className="shrink-0 inline-flex justify-center rounded-full bg-rose-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-rose-800 transition-colors"
              >
                Book with offer
              </Link>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 mt-12 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
        <div className="lg:col-span-8 space-y-14">
          {categories.map(([category, items]) => (
            <section key={category} aria-labelledby={`cat-${slugify(category)}`}>
              <h2
                id={`cat-${slugify(category)}`}
                className="font-display text-2xl font-bold text-rose-900 border-b border-cream-200 pb-2"
              >
                {category}
              </h2>
              <ul className="mt-6 space-y-6 list-none p-0">
                {items.map((s) => {
                  const promosHere = activePromotionsForService(s.id, activePromos);
                  return (
                    <li
                      key={s.id}
                      className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-display text-xl font-bold text-rose-900">{s.name}</h3>
                          <p className="mt-2 text-mauve-600 leading-relaxed">{s.description}</p>
                          {s.durationMins ? (
                            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-mauve-600">
                              ~{s.durationMins} min
                            </p>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-left sm:text-right">
                          <p className="font-display text-2xl font-bold text-rose-900 tabular-nums">
                            {formatServicePrice(s.pricing)}
                          </p>
                          {s.pricing.kind === "range" ? (
                            <p className="text-xs text-mauve-600 mt-1 max-w-[14rem] sm:ml-auto">
                              Range reflects design complexity
                            </p>
                          ) : (
                            <p className="text-xs text-mauve-600 mt-1">Fixed base price</p>
                          )}
                        </div>
                      </div>
                      {s.footnote ? (
                        <p className="mt-4 text-sm text-mauve-600 border-t border-cream-100 pt-4">
                          {s.footnote}
                        </p>
                      ) : null}
                      {promosHere.length > 0 ? (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {promosHere.map((p) => (
                            <li
                              key={p.id}
                              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200 border border-zinc-300 px-3 py-1 text-xs font-semibold text-rose-900"
                            >
                              <span className="text-zinc-700">{p.offerLabel}</span>
                              <span className="text-mauve-600 font-normal">· {p.title}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <p className="text-xs text-mauve-600">
            Pricing book last updated {PRICE_BOOK_UPDATED}. Ranges may be finalized at appointment
            after consultation.
          </p>
        </div>

        <aside className="lg:col-span-4 mt-12 lg:mt-0 lg:sticky lg:top-28 space-y-4">
          <div className="rounded-2xl border-2 border-zinc-300 bg-gradient-to-b from-cream-100 to-cream-50 p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold text-rose-900">Active discounts &amp; promos</h2>
            <p className="mt-2 text-sm text-mauve-600 leading-relaxed">
              Eligibility and dates update here automatically—offers outside their window disappear
              without changing the page layout.
            </p>
            {activePromos.length === 0 ? (
              <p className="mt-6 text-sm text-mauve-600">
                No time-bound promotions right now. Check back for student specials, Founder’s
                Days, and seasonal menus.
              </p>
            ) : (
              <ul className="mt-6 space-y-5 list-none p-0">
                {activePromos.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-xl border border-cream-200 bg-white/90 p-4 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      {p.tags?.includes("northwestern-student")
                        ? "Student"
                        : p.tags?.includes("d9-founders-day")
                          ? "Event"
                          : "Offer"}
                    </p>
                    <p className="mt-1 font-display text-lg font-bold text-rose-900">{p.title}</p>
                    <p className="mt-1 text-sm font-semibold text-rose-800">{p.offerLabel}</p>
                    <p className="mt-2 text-sm text-mauve-600 leading-relaxed">{p.body}</p>
                    <p className="mt-3 text-xs font-medium text-rose-900/90">
                      <span className="text-mauve-600 font-normal">Eligibility: </span>
                      {p.eligibility}
                    </p>
                    <p className="mt-2 text-xs text-mauve-600">
                      Through {formatPromoEnd(p.validTo)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            href="/book"
            className="flex w-full justify-center rounded-full bg-rose-900 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-rose-800 transition-colors"
          >
            Book Online
          </Link>
          <Link
            href="/nail-archive"
            className="flex w-full justify-center rounded-full border border-cream-300 bg-white px-6 py-3 text-sm font-semibold text-rose-900 hover:border-rose-300 transition-colors"
          >
            Browse The Nail Archive
          </Link>
        </aside>
      </div>
    </div>
  );
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatPromoEnd(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
