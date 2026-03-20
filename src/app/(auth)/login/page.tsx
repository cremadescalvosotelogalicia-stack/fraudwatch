"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { InputField, SubmitButton, Alert } from "@/components/forms/AuthFields";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/cases";

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
      setGlobalError("Credenciales incorrectas. Revisa tu email y contrasena.");
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
          Iniciar sesion
        </h1>
        <p className="mt-2 text-sm text-surface-900/50">
          Accede a tu cuenta de FraudWatch
        </p>
      </div>

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
          Iniciar sesion
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-surface-900/50">
        No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800">
          Registrate gratis
        </Link>
      </p>
    </div>
  );
}
