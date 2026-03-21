"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

interface CaseDetail {
  case: {
    id: string;
    title: string;
    accused_company: string;
    description: string;
    category: string;
    status: string;
    is_public: boolean;
    private_token: string;
    created_at: string;
    updated_at: string;
    profiles: { alias: string } | null;
  };
  claims: {
    id: string;
    user_id: string;
    amount_defrauded: number;
    testimony: string;
    share_with_legal: boolean;
    created_at: string;
    profiles: { alias: string } | null;
  }[];
}

const STATUS_OPTIONS = [
  { value: "recruiting", label: "Reclutando afectados" },
  { value: "open", label: "Abierto" },
  { value: "closed", label: "Cerrado" },
  { value: "rejected", label: "Rechazado" },
];

const CATEGORY_OPTIONS = [
  { value: "tax_claims", label: "Reclamaciones tributarias" },
  { value: "admin_claims", label: "Reclamaciones a la Administración" },
  { value: "consumer_competition", label: "Consumo & Competencia" },
];

export default function AdminCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", accused_company: "", description: "", category: "", status: "", is_public: true });
  const [message, setMessage] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/cases/${id}`)
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        if (json.case) {
          setEditForm({
            title: json.case.title,
            accused_company: json.case.accused_company,
            description: json.case.description,
            category: json.case.category,
            status: json.case.status,
            is_public: json.case.is_public,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    // If changing to rejected, show modal instead of saving directly
    if (editForm.status === "rejected" && data?.case.status !== "rejected") {
      setShowRejectModal(true);
      return;
    }

    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setMessage("Caso actualizado correctamente");
      setEditing(false);
      const json = await fetch(`/api/admin/cases/${id}`).then((r) => r.json());
      setData(json);
    } else {
      setMessage("Error al actualizar");
    }
    setSaving(false);
  }

  async function handleConfirmReject() {
    setRejecting(true);
    setMessage("");

    const res = await fetch(`/api/admin/cases/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason }),
    });

    if (res.ok) {
      const result = await res.json();
      setMessage(`Caso rechazado. Se ha notificado a ${result.emailsSent || 0} afectado(s).`);
      setShowRejectModal(false);
      setEditing(false);
      const json = await fetch(`/api/admin/cases/${id}`).then((r) => r.json());
      setData(json);
      if (json.case) {
        setEditForm((prev) => ({ ...prev, status: json.case.status }));
      }
    } else {
      const err = await res.json();
      setMessage("Error al rechazar: " + (err.error || "Error desconocido"));
    }
    setRejecting(false);
  }

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar este caso? Esta accion no se puede deshacer.")) return;
    await fetch(`/api/admin/cases/${id}`, { method: "DELETE" });
    router.push("/admin/casos");
  }

  if (loading) {
    return <AdminShell><p className="py-20 text-center text-surface-500">Cargando...</p></AdminShell>;
  }

  if (!data?.case) {
    return <AdminShell><p className="py-20 text-center text-red-600">Caso no encontrado</p></AdminShell>;
  }

  const c = data.case;
  const totalAffected = data.claims.length;

  return (
    <AdminShell>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-surface-500 mb-6">
        <Link href="/admin/casos" className="hover:text-brand-700">Casos</Link>
        <span>/</span>
        <span className="text-surface-900">{c.title}</span>
      </div>

      {message && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      {/* Case header */}
      <div className="rounded-xl border border-surface-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            {editing ? (
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="text-xl font-bold text-surface-950 border border-surface-200 rounded-lg px-3 py-1 w-full max-w-lg"
              />
            ) : (
              <h1 className="text-xl font-bold text-surface-950">{c.title}</h1>
            )}
            <p className="mt-1 text-sm text-surface-500">
              Creado por <strong>{c.profiles?.alias || "Desconocido"}</strong> el{" "}
              {new Date(c.created_at).toLocaleDateString("es-ES")}
            </p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button onClick={() => setEditing(false)} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50">
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-200">
                  Editar
                </button>
                <button onClick={handleDelete} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <InfoField label="Empresa acusada" editing={editing}>
            {editing ? (
              <input value={editForm.accused_company} onChange={(e) => setEditForm({ ...editForm, accused_company: e.target.value })} className="w-full border border-surface-200 rounded-md px-2 py-1 text-sm" />
            ) : c.accused_company}
          </InfoField>
          <InfoField label="Categoria" editing={editing}>
            {editing ? (
              <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full border border-surface-200 rounded-md px-2 py-1 text-sm">
                {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : CATEGORY_OPTIONS.find((o) => o.value === c.category)?.label || c.category}
          </InfoField>
          <InfoField label="Estado" editing={editing}>
            {editing ? (
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full border border-surface-200 rounded-md px-2 py-1 text-sm">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : STATUS_OPTIONS.find((o) => o.value === c.status)?.label || c.status}
          </InfoField>
          <InfoField label="Visible" editing={editing}>
            {editing ? (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editForm.is_public} onChange={(e) => setEditForm({ ...editForm, is_public: e.target.checked })} className="rounded" />
                <span className="text-sm">{editForm.is_public ? "Publico" : "Privado"}</span>
              </label>
            ) : c.is_public ? "Publico" : "Privado"}
          </InfoField>
        </div>

        {/* Description */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Descripcion</p>
          {editing ? (
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={4}
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm"
            />
          ) : (
            <p className="text-sm text-surface-700 whitespace-pre-wrap">{c.description}</p>
          )}
        </div>

        {/* Summary stats */}
        <div className="mt-6 flex gap-6 border-t border-surface-100 pt-4">
          <div>
            <p className="text-2xl font-bold text-surface-950">{totalAffected}</p>
            <p className="text-xs text-surface-500">Afectados inscritos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-950">
              {data.claims.reduce((sum, cl) => sum + Number(cl.amount_defrauded), 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </p>
            <p className="text-xs text-surface-500">Importe total reclamado</p>
          </div>
        </div>
      </div>

      {/* Affected users table */}
      <div className="rounded-xl border border-surface-200 bg-white p-6 mb-6">
        <h2 className="text-sm font-semibold text-surface-700 mb-4">Afectados inscritos ({data.claims.length})</h2>
        {data.claims.length === 0 ? (
          <p className="text-sm text-surface-400">Sin afectados inscritos</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Usuario</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-surface-500 uppercase">Importe reclamado</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Testimonio</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-surface-500 uppercase">Compartir con legal</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Fecha inscripcion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {data.claims.map((cl) => (
                  <tr key={cl.id} className="hover:bg-surface-50">
                    <td className="px-3 py-2">
                      <Link href={`/admin/usuarios/${cl.user_id}`} className="text-brand-700 hover:underline">
                        {cl.profiles?.alias || cl.user_id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {Number(cl.amount_defrauded).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                    </td>
                    <td className="px-3 py-2 text-surface-600 max-w-[300px] truncate">{cl.testimony}</td>
                    <td className="px-3 py-2 text-center">{cl.share_with_legal ? "Si" : "No"}</td>
                    <td className="px-3 py-2 text-surface-400">{new Date(cl.created_at).toLocaleDateString("es-ES")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject confirmation modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 className="text-center text-xl font-bold text-surface-950">Rechazar caso</h2>
              <p className="mt-2 text-center text-sm text-surface-500">
                Esta accion es irreversible. Se enviara un email de notificacion a
                <strong className="text-surface-700"> {data?.claims.length || 0} afectado(s)</strong> inscritos
                y el caso dejara de ser visible en la plataforma.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Motivo del rechazo (opcional, se incluira en el email)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Ej: El caso no cumple los requisitos minimos para ser tramitado en la plataforma..."
                className="w-full rounded-lg border border-surface-200 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-6">
              <p className="text-sm text-amber-700">
                <strong>Atencion:</strong> Al confirmar, se enviara automaticamente un email a cada afectado
                indicandole que el caso ha sido rechazado. Asegurate de que esta es la decision correcta.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                disabled={rejecting}
                className="rounded-lg border border-surface-200 px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={rejecting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {rejecting ? "Rechazando y notificando..." : "Confirmar rechazo y notificar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function InfoField({ label, children, editing }: { label: string; children: React.ReactNode; editing: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-surface-500 uppercase mb-1">{label}</p>
      <div className={`text-sm ${editing ? "" : "font-medium text-surface-900"}`}>{children}</div>
    </div>
  );
}
