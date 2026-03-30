import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-100/80 mt-24">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 flex flex-col sm:flex-row justify-between gap-8 text-sm text-mauve-600">
        <div>
          <Logo href={null} size="lg" showTagline={false} className="text-left" />
          <p className="mt-4 max-w-sm text-base text-mauve-600">Nail care and nail art for everyone.</p>
        </div>
        <div className="flex gap-8">
          <div className="flex flex-col gap-2">
            <Link href="/about" className="hover:text-rose-800">
              About
            </Link>
            <Link href="/services" className="hover:text-rose-800">
              Services
            </Link>
            <Link href="/contact" className="hover:text-rose-800">
              Contact
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-cream-200 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] text-center text-xs text-mauve-600">
        © {new Date().getFullYear()} Nail Engineer LLC
      </div>
    </footer>
  );
}
