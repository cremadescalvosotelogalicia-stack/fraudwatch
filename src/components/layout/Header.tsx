import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";

export async function Header() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-surface-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="font-display text-lg tracking-tight text-surface-950">
            FraudWatch
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Link
                href="/cases"
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-900/60 transition-colors hover:bg-surface-50 hover:text-surface-900"
              >
                Casos
              </Link>
              <Link
                href="/create"
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-900/60 transition-colors hover:bg-surface-50 hover:text-surface-900"
              >
                Crear caso
              </Link>
              <Link
                href="/profile"
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-900/60 transition-colors hover:bg-surface-50 hover:text-surface-900"
              >
                Perfil
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="ml-2 rounded-xl border border-surface-200 px-4 py-2 text-sm font-medium text-surface-900/60 transition-all hover:bg-surface-50 hover:text-surface-900"
                >
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-900/60 transition-colors hover:bg-surface-50 hover:text-surface-900"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="ml-1 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-700/20 transition-all hover:bg-brand-800"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
