"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const CASE_LABELS: Record<string, string> = {
  patrimonio: "Devolucion del Impuesto sobre el Patrimonio",
  "irpf-hipoteca": "Deduccion IRPF por cancelacion de hipoteca",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En espera",
  reviewing: "En revision",
  accepted: "Aceptada",
  signed: "Firmada",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewing: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  signed: "bg-purple-50 text-purple-700 border-purple-200",
};

interface MasivaClaim {
  id: string;
  case_slug: string;
  nombre: string;
  apellidos: string;
  email: string;
  comunidad_autonoma: string;
  ejercicios: string[];
  documentos: string[] | null;
  status: string;
  created_at: string;
}

export default function MisReclamacionesMasivasPage() {
  const [claims, setClaims] = useState<MasivaClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/reclamaciones");
        if (!res.ok) throw new Error("Error al cargar reclamaciones");
        const json = await res.json();
        setClaims(json.data || []);
      } catch {
        setError("No se pudieron cargar las reclamaciones");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-surface-900/40">Cargando reclamaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-surface-500">
        <Link href="/hub" className="hover:text-brand-700 transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/mis-reclamaciones" className="hover:text-brand-700 transition-colors">
          Mis reclamaciones
        </Link>
        <span>/</span>
        <span className="text-surface-900">Masivas</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
          Mis Reclamaciones Masivas
        </h1>
        <p className="mt-1 text-sm text-surface-900/50">
          {claims.length === 0
            ? "Aun no tienes reclamaciones masivas"
            : `Tienes ${claims.length} reclamacion${claims.length !== 1 ? "es" : ""} masiva${claims.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {claims.length === 0 && !error ? (
        <div className="rounded-2xl border border-surface-200/80 bg-white p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-surface-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-surface-700">
            No tienes reclamaciones masivas
          </h3>
          <p className="mt-2 text-sm text-surface-500">
            Explora las reclamaciones masivas disponibles y unete a las que te afecten.
          </p>
          <div className="mt-6">
            <Link
              href="/masivas"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
            >
              Ver reclamaciones masivas
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="rounded-2xl border border-surface-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-surface-300"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-surface-900">
                      {CASE_LABELS[claim.case_slug] || claim.case_slug}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[claim.status] || "bg-surface-100 text-surface-600 border-surface-200"
                      }`}
                    >
                      {STATUS_LABELS[claim.status] || claim.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-surface-500">
                    <span>
                      Enviada el{" "}
                      {new Date(claim.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>CCAA: {claim.comunidad_autonoma}</span>
                    <span>Ejercicios: {claim.ejercicios?.join(", ") || "-"}</span>
                    <span>
                      {(claim.documentos?.length ?? 0)} documento
                      {(claim.documentos?.length ?? 0) !== 1 ? "s" : ""} subido
                      {(claim.documentos?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/mis-reclamaciones/masivas/${claim.id}`}
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-700 transition-all hover:bg-surface-50 hover:border-surface-300"
                >
                  Ver documentos
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
