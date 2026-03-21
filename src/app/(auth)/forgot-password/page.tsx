"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { InputField, SubmitButton, Alert } from "@/components/forms/AuthFields";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingresa tu email.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || "Error al enviar el correo.");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Error de conexion. Intentalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-600"
          >
            <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            <path d="m16 19 2 2 4-4" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
            Correo enviado
          </h1>
          <p className="mt-3 text-sm text-surface-900/60 leading-relaxed">
            Revisa tu correo para restablecer tu contrasena
          </p>
        </div>
        <Link
          href="/login"
          className="block w-full rounded-xl bg-brand-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-brand-700/20 transition-all hover:bg-brand-800 hover:shadow-lg active:scale-[0.98]"
        >
          Volver a iniciar sesion
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
          Recuperar contrasena
        </h1>
        <p className="mt-2 text-sm text-surface-900/50">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contrasena
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} />}

        <InputField
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <SubmitButton loading={loading} loadingText="Enviando...">
          Enviar enlace de recuperacion
        </SubmitButton>
      </form>

      <Link
        href="/login"
        className="block text-center text-sm text-surface-900/50 hover:text-surface-900/70 transition-colors"
      >
        Volver a iniciar sesion
      </Link>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-surface-900/40">Cargando...</p>
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
