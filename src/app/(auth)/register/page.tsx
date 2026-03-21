"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema } from "@/lib/validators";
import { InputField, CheckboxField, SubmitButton, Alert } from "@/components/forms/AuthFields";
import { OAuthButtons, OAuthDivider } from "@/components/forms/OAuthButtons";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    alias: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setGlobalError(data.error || "Error al crear la cuenta");
      setLoading(false);
      return;
    }

    router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
          Crear cuenta gratis
        </h1>
        <p className="mt-2 text-sm text-surface-900/50">
          Unete a Crowd Litigations y protege tus derechos
        </p>
      </div>

      {/* OAuth buttons */}
      <OAuthButtons redirectTo="/hub" />
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
          label="Alias publico"
          type="text"
          placeholder="tu-alias"
          value={form.alias}
          onChange={(e) => setForm({ ...form, alias: e.target.value })}
          error={errors.alias}
          autoComplete="username"
        />

        <InputField
          label="Contrasena"
          type="password"
          placeholder="Min. 8 caracteres, 1 mayuscula, 1 numero"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          autoComplete="new-password"
        />

        <div className="space-y-3 pt-2">
          <CheckboxField
            id="acceptTerms"
            label={
              <>
                Acepto los{" "}
                <span className="text-brand-700 font-medium">terminos de servicio</span>
              </>
            }
            checked={form.acceptTerms}
            onChange={(checked) => setForm({ ...form, acceptTerms: checked })}
            error={errors.acceptTerms}
          />
          <CheckboxField
            id="acceptPrivacy"
            label={
              <>
                Acepto la{" "}
                <span className="text-brand-700 font-medium">politica de privacidad</span> y el
                tratamiento de mis datos conforme al RGPD
              </>
            }
            checked={form.acceptPrivacy}
            onChange={(checked) => setForm({ ...form, acceptPrivacy: checked })}
            error={errors.acceptPrivacy}
          />
        </div>

        <SubmitButton loading={loading} loadingText="Creando cuenta...">
          Crear cuenta con email
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-surface-900/50">
        Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
