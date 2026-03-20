"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitButton, Alert } from "@/components/forms/AuthFields";

export default function PrivacyPage() {
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleExport() {
    setError("");
    setMessage("");
    setExportLoading(true);

    const res = await fetch("/api/privacy/export");
    if (!res.ok) {
      setError("Error al exportar los datos");
      setExportLoading(false);
      return;
    }

    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fraudwatch-mis-datos.json";
    a.click();
    URL.revokeObjectURL(url);

    setMessage("Datos exportados correctamente");
    setExportLoading(false);
  }

  async function handleDelete() {
    if (!confirm("ATENCION: Esto eliminara tu cuenta y TODOS tus datos de forma permanente. Esta seguro?")) {
      return;
    }
    if (!confirm("Esta accion NO se puede deshacer. Confirma por ultima vez.")) {
      return;
    }

    setError("");
    setDeleteLoading(true);

    const res = await fetch("/api/privacy/delete", { method: "DELETE" });

    if (!res.ok) {
      setError("Error al eliminar la cuenta");
      setDeleteLoading(false);
      return;
    }

    window.location.href = "/?deleted=true";
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <Link href="/profile" className="text-sm text-brand-700 hover:text-brand-800 font-medium">
          &larr; Volver al perfil
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-surface-950">
          Privacidad y datos
        </h1>
        <p className="mt-1 text-sm text-surface-900/50">
          Tus derechos RGPD: acceso, portabilidad y supresion de datos
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {message && <Alert type="success" message={message} />}

      {/* Export data */}
      <div className="rounded-2xl border border-surface-200/60 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-surface-950">Exportar mis datos</h2>
        <p className="text-sm text-surface-900/50">
          Descarga una copia de todos tus datos en formato JSON (derecho de portabilidad, Art. 20 RGPD).
        </p>
        <SubmitButton loading={exportLoading} loadingText="Exportando...">
          <span onClick={handleExport}>Descargar mis datos</span>
        </SubmitButton>
      </div>

      {/* Delete account */}
      <div className="rounded-2xl border border-red-200/60 bg-red-50/50 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-red-700">Eliminar mi cuenta</h2>
        <p className="text-sm text-red-600/70">
          Esto eliminara permanentemente tu cuenta, perfil, testimonios y todos los datos asociados
          (derecho de supresion, Art. 17 RGPD). Esta accion NO se puede deshacer.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleteLoading}
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {deleteLoading ? "Eliminando..." : "Eliminar mi cuenta permanentemente"}
        </button>
      </div>
    </div>
  );
}
