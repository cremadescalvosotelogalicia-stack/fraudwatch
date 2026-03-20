"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { claimSchema } from "@/lib/validators";
import { InputField, TextareaField, CheckboxField, SubmitButton, Alert } from "@/components/forms/AuthFields";

export default function JoinCasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [form, setForm] = useState({
    amount_defrauded: "",
    testimony: "",
    share_with_legal: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    const payload = {
      case_id: caseId,
      amount_defrauded: parseFloat(form.amount_defrauded) || 0,
      testimony: form.testimony,
      share_with_legal: form.share_with_legal,
    };

    const result = claimSchema.safeParse(payload);
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

    const res = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setGlobalError(data.error || "Error al enviar tu testimonio");
      setLoading(false);
      return;
    }

    router.push(`/cases/${caseId}`);
    router.refresh();
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <Link href={`/cases/${caseId}`} className="text-sm text-brand-700 hover:text-brand-800 font-medium">
          &larr; Volver al caso
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-surface-950">
          Unirme como afectado
        </h1>
        <p className="mt-1 text-sm text-surface-900/50">
          Anade tu testimonio y el importe defraudado
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {globalError && <Alert type="error" message={globalError} />}

        <InputField
          label="Importe defraudado (EUR)"
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={form.amount_defrauded}
          onChange={(e) => setForm({ ...form, amount_defrauded: e.target.value })}
          error={errors.amount_defrauded}
        />

        <TextareaField
          label="Tu testimonio"
          placeholder="Describe lo que te ocurrio con el mayor detalle posible (min. 20 caracteres)"
          rows={6}
          value={form.testimony}
          onChange={(e) => setForm({ ...form, testimony: e.target.value })}
          error={errors.testimony}
        />

        <CheckboxField
          id="share_with_legal"
          label="Autorizo compartir mis datos con un equipo legal para una posible accion colectiva"
          checked={form.share_with_legal}
          onChange={(checked) => setForm({ ...form, share_with_legal: checked })}
        />

        <SubmitButton loading={loading} loadingText="Enviando...">
          Enviar testimonio
        </SubmitButton>
      </form>
    </div>
  );
}
