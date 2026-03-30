import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";

type Props = {
  title: string;
  intro?: string;
  className?: string;
  children: React.ReactNode;
};

export function MarketingLayout({ title, intro, children, className }: Props) {
  return (
    <div
      className={`mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20${className ? ` ${className}` : ""}`}
    >
      <h1 className={PAGE_TITLE_CLASS}>{title}</h1>
      {intro ? (
        <p className="mt-4 text-lg text-mauve-600 leading-relaxed">{intro}</p>
      ) : null}
      <div className="mt-10 space-y-6 text-mauve-600 leading-relaxed">{children}</div>
    </div>
  );
}
