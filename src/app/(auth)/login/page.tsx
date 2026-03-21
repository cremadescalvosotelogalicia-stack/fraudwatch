"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { InputField, SubmitButton, Alert } from "@/components/forms/AuthFields";
import { OAuthButtons, OAuthDivider } from "@/components/forms/OAuthButtons";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/cases";
  const registered = searchParams.get("registered");
  const callbackError = searchParams.get("error");

  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginInput;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setGlobalError("Tu email aun no ha sido verificado. Revisa tu bandeja de entrada.");
      } else {
        setGlobalError("Credenciales incorrectas. Revisa tu email y contrasena.");
      }
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
          Iniciar sesion
        </h1>
        <p className="mt-2 text-sm text-surface-900/50">
          Accede a tu cuenta de Crowd Litigations
        </p>
      </div>

      {registered && (
        <Alert
          type="success"
          message="Cuenta creada. Revisa tu email para verificar tu cuenta antes de iniciar sesion."
        />
      )}

      {callbackError === "auth_callback_failed" && (
        <Alert
          type="error"
          message="Error al iniciar sesion con el proveedor externo. Intentalo de nuevo."
        />
      )}

      {/* OAuth buttons */}
      <OAuthButtons redirectTo={next} />
      <OAuthDivider />

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {globalError && <Alert type="error" message={globalError} />}

        <InputField
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          autoComplete="email"
        />

        <InputField
          label="Contrasena"
          type="password"
          placeholder="Tu contrasena"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          autoComplete="current-password"
        />

        <SubmitButton loading={loading} loadingText="Iniciando sesion...">
          Iniciar sesion con email
        </SubmitButton>
      </form>

      <Link href="/forgot-password" className="block text-center text-sm text-surface-900/40 hover:text-brand-700 transition-colors">
        Olvidaste tu contrasena?
      </Link>

      <p className="text-center text-sm text-surface-900/50">
        No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800">
          Registrate gratis
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-surface-900/40">Cargando...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
