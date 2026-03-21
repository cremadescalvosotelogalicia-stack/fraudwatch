"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

interface UserDetail {
  profile: {
    id: string;
    alias: string;
    email: string | null;
    role: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    last_sign_in: string | null;
    provider: string;
    created_at_auth: string | null;
  };
  claims: {
    id: string;
    amount_defrauded: number;
    testimony: string;
    share_with_legal: boolean;
    created_at: string;
    cases: { id: string; title: string; status: string; accused_company: string } | null;
  }[];
  casesCreated: {
    id: string;
    title: string;
    status: string;
    category: string;
    created_at: string;
    claims: { count: number }[];
  }[];
  evidences: {
    id: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    storage_path: string;
    created_at: string;
  }[];
  consents: {
    id: string;
    consent_type: string;
    document_version: string;
    accepted: boolean;
    ip_address: string;
    created_at: string;
  }[];
}

const STATUS_LABELS: Record<string, string> = {
  open: "Abierto", under_review: "En revision", closed: "Cerrado", won: "Ganado", lost: "Perdido",
};

const CONSENT_LABELS: Record<string, string> = {
  terms_of_service: "Terminos de servicio",
  privacy_policy: "Politica de privacidad",
  data_sharing_legal_team: "Compartir datos con equipo legal",
  cookie_consent: "Consentimiento cookies",
};

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function changeRole(newRole: string) {
    setUpdatingRole(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, role: newRole }),
    });
    setData((prev) =>
      prev ? { ...prev, profile: { ...prev.profile, role: newRole } } : prev
    );
    setUpdatingRole(false);
  }

  async function downloadFile(storagePath: string, fileName: string) {
    const res = await fetch("/api/admin/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storagePath }),
    });
    const { url } = await res.json();
    if (url) window.open(url, "_blank");
  }

  if (loading) {
    return <AdminShell><p className="py-20 text-center text-surface-500">Cargando...</p></AdminShell>;
  }

  if (!data?.profile) {
    return <AdminShell><p className="py-20 text-center text-red-600">Usuario no encontrado</p></AdminShell>;
  }

  const u = data.profile;
  const totalClaimed = data.claims.reduce((sum, cl) => sum + Number(cl.amount_defrauded), 0);

  return (
    <AdminShell>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-surface-500 mb-6">
        <Link href="/admin/usuarios" className="hover:text-brand-700">Usuarios</Link>
        <span>/</span>
        <span className="text-surface-900">{u.alias}</span>
      </div>

      {/* User header */}
      <div className="rounded-xl border border-surface-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xl font-bold">
              {u.alias.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-950">{u.alias}</h1>
              <p className="text-sm text-surface-500">{u.email || "Sin email"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-surface-500">Rol:</span>
            <select
              value={u.role}
              onChange={(e) => changeRole(e.target.value)}
              disabled={updatingRole}
              className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm font-medium focus:border-brand-500 focus:outline-none disabled:opacity-50"
            >
              <option value="client">Cliente</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Proveedor</p>
            <p className="text-sm font-medium text-surface-900 capitalize">{u.provider}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Registro</p>
            <p className="text-sm font-medium text-surface-900">{new Date(u.created_at).toLocaleDateString("es-ES")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Ultimo acceso</p>
            <p className="text-sm font-medium text-surface-900">
              {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString("es-ES") : "Nunca"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Verificado</p>
            <p className="text-sm font-medium text-surface-900">{u.is_verified ? "Si" : "No"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase mb-1">ID</p>
            <p className="text-xs font-mono text-surface-500 truncate">{u.id}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 flex gap-6 border-t border-surface-100 pt-4">
          <div>
            <p className="text-2xl font-bold text-surface-950">{data.casesCreated.length}</p>
            <p className="text-xs text-surface-500">Casos creados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-950">{data.claims.length}</p>
            <p className="text-xs text-surface-500">Reclamaciones</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-950">{totalClaimed.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</p>
            <p className="text-xs text-surface-500">Total reclamado</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-950">{data.evidences.length}</p>
            <p className="text-xs text-surface-500">Documentos</p>
          </div>
        </div>
      </div>

      {/* Claims */}
      <div className="rounded-xl border border-surface-200 bg-white p-6 mb-6">
        <h2 className="text-sm font-semibold text-surface-700 mb-4">Reclamaciones ({data.claims.length})</h2>
        {data.claims.length === 0 ? (
          <p className="text-sm text-surface-400">Sin reclamaciones</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Caso</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Empresa</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-surface-500 uppercase">Importe</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-surface-500 uppercase">Estado caso</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {data.claims.map((cl) => (
                  <tr key={cl.id} className="hover:bg-surface-50">
                    <td className="px-3 py-2">
                      {cl.cases ? (
                        <Link href={`/admin/casos/${cl.cases.id}`} className="text-brand-700 hover:underline">
                          {cl.cases.title}
                        </Link>
                      ) : "-"}
                    </td>
                    <td className="px-3 py-2 text-surface-600">{cl.cases?.accused_company || "-"}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {Number(cl.amount_defrauded).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-600">
                        {STATUS_LABELS[cl.cases?.status || ""] || cl.cases?.status || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-surface-400">{new Date(cl.created_at).toLocaleDateString("es-ES")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cases created */}
      {data.casesCreated.length > 0 && (
        <div className="rounded-xl border border-surface-200 bg-white p-6 mb-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-4">Casos creados ({data.casesCreated.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Titulo</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-surface-500 uppercase">Estado</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-surface-500 uppercase">Reclamac.</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {data.casesCreated.map((cs) => (
                  <tr key={cs.id} className="hover:bg-surface-50">
                    <td className="px-3 py-2">
                      <Link href={`/admin/casos/${cs.id}`} className="text-brand-700 hover:underline">{cs.title}</Link>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-600">
                        {STATUS_LABELS[cs.status] || cs.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-semibold">{cs.claims?.[0]?.count || 0}</td>
                    <td className="px-3 py-2 text-surface-400">{new Date(cs.created_at).toLocaleDateString("es-ES")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evidences */}
      <div className="rounded-xl border border-surface-200 bg-white p-6 mb-6">
        <h2 className="text-sm font-semibold text-surface-700 mb-4">Documentos ({data.evidences.length})</h2>
        {data.evidences.length === 0 ? (
          <p className="text-sm text-surface-400">Sin documentos</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Archivo</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Tipo</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Fecha</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-surface-500 uppercase">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {data.evidences.map((ev) => (
                  <tr key={ev.id} className="hover:bg-surface-50">
                    <td className="px-3 py-2 font-medium">{ev.file_name}</td>
                    <td className="px-3 py-2 text-surface-500 font-mono text-xs">{ev.mime_type}</td>
                    <td className="px-3 py-2 text-surface-400">{new Date(ev.created_at).toLocaleDateString("es-ES")}</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => downloadFile(ev.storage_path, ev.file_name)} className="rounded bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100">
                        Descargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Consent logs */}
      <div className="rounded-xl border border-surface-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-surface-700 mb-4">Consentimientos RGPD ({data.consents.length})</h2>
        {data.consents.length === 0 ? (
          <p className="text-sm text-surface-400">Sin registros de consentimiento</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Tipo</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Version</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-surface-500 uppercase">Aceptado</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">IP</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {data.consents.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-50">
                    <td className="px-3 py-2">{CONSENT_LABELS[c.consent_type] || c.consent_type}</td>
                    <td className="px-3 py-2 text-surface-500">{c.document_version}</td>
                    <td className="px-3 py-2 text-center">{c.accepted ? "Si" : "No"}</td>
                    <td className="px-3 py-2 text-surface-500 font-mono text-xs">{c.ip_address}</td>
                    <td className="px-3 py-2 text-surface-400">{new Date(c.created_at).toLocaleString("es-ES")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
