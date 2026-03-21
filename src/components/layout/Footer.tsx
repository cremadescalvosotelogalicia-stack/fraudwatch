import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-surface-200/60 bg-surface-50/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Crowd Litigations"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="font-display text-sm text-surface-900/60">Crowd Litigations</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/cases" className="text-xs text-surface-900/40 transition-colors hover:text-surface-900/70">
              Casos
            </Link>
            <Link href="/profile/privacy" className="text-xs text-surface-900/40 transition-colors hover:text-surface-900/70">
              Privacidad
            </Link>
            <span className="text-xs text-surface-900/30">·</span>
            <span className="text-xs text-surface-900/40">dpo@crowdlitigations.com</span>
          </nav>

          <p className="text-xs text-surface-900/30">
            © {new Date().getFullYear()} Crowd Litigations · RGPD compliant
          </p>
        </div>
      </div>
    </footer>
  );
}
