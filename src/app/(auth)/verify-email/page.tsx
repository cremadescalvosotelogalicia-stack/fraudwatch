"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "tu correo";

  return (
    <div className="space-y-6 text-center">
      {/* Email icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-600"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
          Revisa tu correo
        </h1>
        <p className="mt-3 text-sm text-surface-900/60 leading-relaxed">
          Hemos enviado un enlace de verificacion a{" "}
          <span className="font-semibold text-surface-900">{email}</span>.
          <br />
          Haz clic en el enlace para activar tu cuenta.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Si no ves el correo, revisa tu carpeta de <strong>spam</strong> o correo no deseado.
      </div>

      <div className="pt-2 space-y-3">
        <Link
          href="/login"
          className="block w-full rounded-xl bg-brand-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-brand-700/20 transition-all hover:bg-brand-800 hover:shadow-lg active:scale-[0.98]"
        >
          Ir a iniciar sesion
        </Link>
        <Link
          href="/register"
          className="block text-center text-sm text-surface-900/50 hover:text-surface-900/70 transition-colors"
        >
          Volver al registro
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-surface-900/40">Cargando...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
