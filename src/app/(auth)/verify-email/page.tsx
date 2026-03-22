"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SubmitButton, Alert } from "@/components/forms/AuthFields";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
    }
    setCode(newCode);

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = code.join("");
    if (token.length !== 6) {
      setError("Ingresa el codigo completo de 6 digitos.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al verificar el codigo.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Error de conexion. Intentalo de nuevo.");
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al reenviar el codigo.");
      } else {
        setSuccess("Codigo reenviado. Revisa tu correo.");
      }
    } catch {
      setError("Error de conexion. Intentalo de nuevo.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
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
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-surface-950">
          Verifica tu correo
        </h1>
        <p className="mt-2 text-sm text-surface-900/60 leading-relaxed">
          Hemos enviado un codigo de 6 digitos a{" "}
          <span className="font-semibold text-surface-900">{email || "tu correo"}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="h-12 w-12 rounded-xl border border-surface-200 bg-white text-center text-lg font-bold text-surface-950 transition-all focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400"
            />
          ))}
        </div>

        <SubmitButton loading={loading} loadingText="Verificando...">
          Verificar
        </SubmitButton>
      </form>

      <div className="space-y-3 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-sm text-surface-900/40 hover:text-brand-700 transition-colors disabled:opacity-50"
        >
          {resending ? "Reenviando..." : "Reenviar codigo"}
        </button>

        <Link
          href="/login"
          className="block text-sm text-surface-900/50 hover:text-surface-900/70 transition-colors"
        >
          Volver a iniciar sesion
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
