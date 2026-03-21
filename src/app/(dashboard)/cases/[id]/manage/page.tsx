"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { SubmitButton, Alert } from "@/components/forms/AuthFields";
import type { Case, CaseStatus } from "@/types/database";

const statusOptions: { value: CaseStatus; label: string }[] = [
  { value: "recruiting", label: "Reclutando afectados" },
  { value: "open", label: "Abierto" },
  { value: "closed", label: "Cerrado" },
];

export default function ManageCasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [case_, setCase] = useState<Case | null>(null);
  const [status, setStatus] = useState<CaseStatus>("open");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (data) {
        setCase(data as unknown as Case);
        setStatus(data.status as CaseStatus);
      }
    }
    load();
  }, [caseId, supabase]);

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { error: updateError } = await supabase
      .from("cases")
      .update({ status })
      .eq("id", caseId);

    if (updateError) {
      setError("Error al actualizar el estado");
    } else {
      setSuccess("Estado actualizado correctamente");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Estas seguro de que quieres eliminar este caso? Esta accion no se puede deshacer.")) {
      return;
    }

    setLoading(true);
    const { error: deleteError } = await supabase.from("cases").delete().eq("id", caseId);

    if (deleteError) {
      setError("Error al eliminar el caso");
      setLoading(false);
    } else {
      router.push("/cases");
      router.refresh();
    }
  }

  if (!case_) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-surface-900/40">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <Link href={`/cases/${caseId}`} className="text-sm text-brand-700 hover:text-brand-800 font-medium">
          &larr; Volver al caso
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-surface-950">
          Gestionar caso
        </h1>
        <p className="mt-1 text-sm text-surface-900/50">{case_.accused_company}</p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Update status */}
      <form onSubmit={handleUpdateStatus} className="rounded-2xl border border-surface-200/60 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-surface-950">Cambiar estado</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as CaseStatus)}
          className="block w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-surface-950 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <SubmitButton loading={loading} loadingText="Actualizando...">
          Actualizar estado
        </SubmitButton>
      </form>

      {/* Delete */}
      <div className="rounded-2xl border border-red-200/60 bg-red-50/50 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-red-700">Zona peligrosa</h2>
        <p className="text-sm text-red-600/70">
          Eliminar el caso es permanente y eliminara todos los testimonios asociados.
        </p>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          Eliminar caso
        </button>
      </div>
    </div>
  );
}
