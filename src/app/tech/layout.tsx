export default function TechLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-rose-900 text-cream-50 text-center text-xs font-medium py-2.5 px-4">
        Jayden’s scheduling control center — not linked from the public site menu. Bookmark this URL.
      </div>
      {children}
    </>
  );
}
