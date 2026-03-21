"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { InputField, SubmitButton, Alert } from "@/components/forms/AuthFields";

function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Completa ambos campos.");
      return;
    }

    if (password.length < 8) {
      setError("La contrasena debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message || "Error al actualizar la contrasena.");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setError("Error de conexion. Intentalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
          Nueva contrasena
        </h1>
        <p className="mt-2 text-sm text-surface-900/50">
          Ingresa tu nueva contrasena
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} />}

        <InputField
          label="Nueva contrasena"
          type="password"
          placeholder="Min. 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <InputField
          label="Confirmar contrasena"
          type="password"
          placeholder="Repite tu contrasena"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />

        <SubmitButton loading={loading} loadingText="Actualizando...">
          Restablecer contrasena
        </SubmitButton>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-surface-900/40">Cargando...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
