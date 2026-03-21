"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

const CATEGORY_OPTIONS = [
  { value: "investment_fraud", label: "Fraude de inversion" },
  { value: "romance_scam", label: "Estafa romantica" },
  { value: "phishing", label: "Phishing" },
  { value: "ecommerce_fraud", label: "Fraude ecommerce" },
  { value: "rental_fraud", label: "Fraude alquiler" },
  { value: "other", label: "Otros" },
];

const STATUS_OPTIONS = [
  { value: "open", label: "Abierto" },
  { value: "under_review", label: "En revision" },
];

export default function AdminCrearCasoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    accused_company: "",
    description: "",
    category: "other",
    status: "open",
    is_public: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.title.length < 10) { setError("El titulo debe tener al menos 10 caracteres"); return; }
    if (form.accused_company.length < 2) { setError("La empresa acusada debe tener al menos 2 caracteres"); return; }
    if (form.description.length < 50) { setError("La descripcion debe tener al menos 50 caracteres"); return; }

    setLoading(true);

    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al crear el caso");
      setLoading(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/admin/casos/${id}`);
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-surface-950 mb-6">Crear nuevo caso</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="rounded-xl border border-surface-200 bg-white p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Titulo del caso *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Ej: Cartel de fabricantes de automoviles"
              className="w-full rounded-lg border border-surface-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-surface-400">{form.title.length}/120 caracteres (min. 10)</p>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Empresa acusada *</label>
            <input
              type="text"
              value={form.accused_company}
              onChange={(e) => updateField("accused_company", e.target.value)}
              placeholder="Ej: Volkswagen, BMW, Mercedes-Benz"
              className="w-full rounded-lg border border-surface-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Estado inicial</label>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Descripcion detallada *</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={6}
              placeholder="Describe el caso en detalle: que ocurrio, quienes son los afectados, que se reclama..."
              className="w-full rounded-lg border border-surface-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-surface-400">{form.description.length} caracteres (min. 50)</p>
          </div>

          {/* Public */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_public}
                onChange={(e) => updateField("is_public", e.target.checked)}
                className="h-4 w-4 rounded border-surface-300 text-brand-700 focus:ring-brand-500"
              />
              <span className="text-sm text-surface-700">Caso publico (visible en el directorio)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creando..." : "Crear caso"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/casos")}
            className="rounded-lg border border-surface-200 px-6 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
