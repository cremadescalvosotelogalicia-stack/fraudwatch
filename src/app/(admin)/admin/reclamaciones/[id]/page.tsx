"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

interface MasivaClaimDetail {
  id: string;
  case_slug: string;
  full_name: string;
  email: string;
  phone: string | null;
  dni: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  ccaa: string | null;
  ejercicios: string[] | null;
  status: string;
  documents: string[] | null;
  notes: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  reviewing: "En revisi\u00f3n",
  accepted: "Aceptada",
  signed: "Firmada",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewing: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  signed: "bg-purple-100 text-purple-700",
};

const CASE_LABELS: Record<string, string> = {
  patrimonio: "Imp. Patrimonio",
  "irpf-hipoteca": "IRPF Hipoteca",
  "irpf-maternidad": "IRPF Maternidad",
  "plusvalia-municipal": "Plusval\u00eda Municipal",
  "gastos-hipotecarios": "Gastos Hipotecarios",
  "tarjetas-revolving": "Tarjetas Revolving",
  "clausula-suelo": "Cl\u00e1usula Suelo",
  "irpf-prestaciones": "IRPF Prestaciones",
};

function formatCaseSlug(slug: string): string {
  if (CASE_LABELS[slug]) return CASE_LABELS[slug];
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function AdminReclamacionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [claim, setClaim] = useState<MasivaClaimDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchClaim() {
      setLoading(true);
      const res = await fetch(`/api/admin/reclamaciones/${id}`);
      if (!res.ok) {
        setError("Reclamaci\u00f3n no encontrada");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setClaim(json.data);
      setLoading(false);
    }
    if (id) fetchClaim();
  }, [id]);

  async function changeStatus(newStatus: string) {
    if (!claim) return;
    setUpdatingStatus(true);
    await fetch(`/api/admin/reclamaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setClaim({ ...claim, status: newStatus });
    setUpdatingStatus(false);
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/admin/reclamaciones/${id}`, { method: "DELETE" });
    setDeleting(false);
    router.push("/admin/reclamaciones");
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-surface-400">Cargando...</p>
        </div>
      </AdminShell>
    );
  }

  if (error || !claim) {
    return (
      <AdminShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-sm text-surface-400">{error || "No encontrada"}</p>
          <Link href="/admin/reclamaciones" className="text-sm text-brand-700 hover:underline">
            Volver a reclamaciones
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/reclamaciones"
          className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-950">{claim.full_name}</h1>
          <p className="text-sm text-surface-500">
            {formatCaseSlug(claim.case_slug)} &middot; Creada el {new Date(claim.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          Eliminar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal data */}
          <div className="rounded-xl border border-surface-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-surface-950 mb-4">Datos personales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Nombre completo" value={claim.full_name} />
              <InfoField label="Email" value={claim.email} />
              <InfoField label="Tel\u00e9fono" value={claim.phone} />
              <InfoField label="DNI/NIF" value={claim.dni} />
              <InfoField label="Direcci\u00f3n" value={claim.address} />
              <InfoField label="Ciudad" value={claim.city} />
              <InfoField label="C\u00f3digo postal" value={claim.postal_code} />
              <InfoField label="Comunidad Aut\u00f3noma" value={claim.ccaa} />
            </div>
          </div>

          {/* Claim details */}
          <div className="rounded-xl border border-surface-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-surface-950 mb-4">Detalles de la reclamaci&oacute;n</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Caso" value={formatCaseSlug(claim.case_slug)} />
              <InfoField label="Ejercicios fiscales" value={claim.ejercicios?.join(", ")} />
              {claim.notes && (
                <div className="sm:col-span-2">
                  <InfoField label="Notas" value={claim.notes} />
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-surface-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-surface-950 mb-4">
              Documentos ({claim.documents?.length || 0})
            </h2>
            {claim.documents && claim.documents.length > 0 ? (
              <div className="space-y-2">
                {claim.documents.map((doc, i) => {
                  const filename = doc.split("/").pop() || doc;
                  return (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-surface-100 bg-surface-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-surface-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="text-sm text-surface-700 truncate max-w-[300px]">{filename}</span>
                      </div>
                      <a
                        href={`/api/admin/reclamaciones/${claim.id}/documents/${encodeURIComponent(filename)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Descargar
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-surface-400">No hay documentos adjuntos</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status card */}
          <div className="rounded-xl border border-surface-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-surface-950 mb-4">Estado</h2>
            <div className="space-y-3">
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[claim.status] || "bg-surface-100 text-surface-600"}`}>
                {STATUS_LABELS[claim.status] || claim.status}
              </span>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">Cambiar estado</label>
                <select
                  value={claim.status}
                  onChange={(e) => changeStatus(e.target.value)}
                  disabled={updatingStatus}
                  className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50"
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Meta card */}
          <div className="rounded-xl border border-surface-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-surface-950 mb-4">Informaci&oacute;n</h2>
            <div className="space-y-3">
              <InfoField label="ID" value={claim.id} />
              <InfoField
                label="Fecha de creaci\u00f3n"
                value={new Date(claim.created_at).toLocaleString("es-ES", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              />
              {claim.updated_at && (
                <InfoField
                  label="\u00daltima actualizaci\u00f3n"
                  value={new Date(claim.updated_at).toLocaleString("es-ES", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                />
              )}
              {claim.user_id && (
                <div>
                  <p className="text-xs font-medium text-surface-500 mb-0.5">Usuario registrado</p>
                  <Link
                    href={`/admin/usuarios/${claim.user_id}`}
                    className="text-sm text-brand-700 hover:underline"
                  >
                    Ver perfil del usuario
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-surface-950">Eliminar reclamaci&oacute;n</h2>
              <p className="mt-2 text-sm text-surface-500">
                Se eliminar&aacute; permanentemente la reclamaci&oacute;n de <strong className="text-surface-700">{claim.full_name}</strong>, incluyendo todos los documentos asociados.
              </p>
              <p className="mt-2 text-sm font-medium text-red-600">
                Esta acci&oacute;n no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="rounded-lg border border-surface-200 px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Eliminando..." : "Eliminar definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-surface-500 mb-0.5">{label}</p>
      <p className="text-sm text-surface-900">{value || "-"}</p>
    </div>
  );
}
