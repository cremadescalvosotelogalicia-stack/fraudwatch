import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-surface-200/60 bg-surface-50/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-700">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="font-display text-sm text-surface-900/60">FraudWatch</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/cases" className="text-xs text-surface-900/40 transition-colors hover:text-surface-900/70">
              Casos
            </Link>
            <Link href="/profile/privacy" className="text-xs text-surface-900/40 transition-colors hover:text-surface-900/70">
              Privacidad
            </Link>
            <span className="text-xs text-surface-900/30">·</span>
            <span className="text-xs text-surface-900/40">dpo@fraudwatch.es</span>
          </nav>

          <p className="text-xs text-surface-900/30">
            © {new Date().getFullYear()} FraudWatch · RGPD compliant
          </p>
        </div>
      </div>
    </footer>
  );
}
