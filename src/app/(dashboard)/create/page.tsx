"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { caseSchema, type CaseInput } from "@/lib/validators";
import { InputField, TextareaField, CheckboxField, SubmitButton, Alert } from "@/components/forms/AuthFields";

const categoryOptions = [
  { value: "tax_claims", label: "Reclamaciones tributarias" },
  { value: "admin_claims", label: "Reclamaciones a la Administración" },
  { value: "consumer_competition", label: "Consumo & Competencia" },
];

export default function CreateCasePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    accused_company: "",
    description: "",
    category: "tax_claims",
    is_public: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    const result = caseSchema.safeParse(form);
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

    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setGlobalError(data.error || "Error al crear el caso");
      setLoading(false);
      return;
    }

    router.push(`/cases/${data.id}`);
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <Link href="/cases" className="text-sm text-brand-700 hover:text-brand-800 font-medium">
          &larr; Volver al directorio
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-surface-950">
          Crear nuevo caso
        </h1>
        <p className="mt-1 text-sm text-surface-900/50">
          Documenta el fraude para que otros afectados puedan unirse
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {globalError && <Alert type="error" message={globalError} />}

        <InputField
          label="Empresa acusada"
          type="text"
          placeholder="Nombre de la empresa o entidad"
          value={form.accused_company}
          onChange={(e) => setForm({ ...form, accused_company: e.target.value })}
          error={errors.accused_company}
        />

        <InputField
          label="Titulo del caso"
          type="text"
          placeholder="Breve descripcion del fraude (min. 10 caracteres)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          error={errors.title}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-900/70">
            Categoria
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="block w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-surface-950 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
        </div>

        <TextareaField
          label="Descripcion detallada"
          placeholder="Explica el fraude con el mayor detalle posible (min. 50 caracteres)"
          rows={8}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          error={errors.description}
        />

        <CheckboxField
          id="is_public"
          label="Caso publico (visible en el directorio para todos los usuarios)"
          checked={form.is_public}
          onChange={(checked) => setForm({ ...form, is_public: checked })}
        />

        <SubmitButton loading={loading} loadingText="Creando caso...">
          Crear caso
        </SubmitButton>
      </form>
    </div>
  );
}
