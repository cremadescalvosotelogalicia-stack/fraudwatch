"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

interface MasivaClaim {
  id: string;
  case_slug: string;
  full_name: string;
  email: string;
  phone: string | null;
  ccaa: string | null;
  ejercicios: string[] | null;
  status: string;
  documents: string[] | null;
  user_id: string | null;
  created_at: string;
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

export default function AdminReclamacionesPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<MasivaClaim[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [caseFilter, setCaseFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MasivaClaim | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [caseSlugs, setCaseSlugs] = useState<string[]>([]);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (caseFilter) params.set("case_slug", caseFilter);

    const res = await fetch(`/api/admin/reclamaciones?${params}`);
    const json = await res.json();
    setClaims(json.data || []);
    setTotal(json.total || 0);
    if (json.case_slugs) setCaseSlugs(json.case_slugs);
    setLoading(false);
    setSelected(new Set());
  }, [page, search, statusFilter, caseFilter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const totalPages = Math.ceil(total / 20);

  async function changeStatus(claimId: string, newStatus: string) {
    setUpdatingStatus(claimId);
    await fetch(`/api/admin/reclamaciones/${claimId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: newStatus } : c))
    );
    setUpdatingStatus(null);
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    if (deleteTarget) {
      await fetch(`/api/admin/reclamaciones/${deleteTarget.id}`, { method: "DELETE" });
    } else {
      await fetch("/api/admin/reclamaciones", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setSelected(new Set());
    setDeleting(false);
    fetchClaims();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === claims.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(claims.map((c) => c.id)));
    }
  }

  async function exportCsv() {
    const params = new URLSearchParams({ format: "csv" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (caseFilter) params.set("case_slug", caseFilter);

    const res = await fetch(`/api/admin/reclamaciones?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reclamaciones_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-950">Reclamaciones Masivas</h1>
        <button
          onClick={exportCsv}
          className="rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-200 transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 w-64"
        />
        <select
          value={caseFilter}
          onChange={(e) => { setCaseFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Todos los casos</option>
          {caseSlugs.map((slug) => (
            <option key={slug} value={slug}>{formatCaseSlug(slug)}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-3">
          <span className="text-sm font-medium text-red-700">
            {selected.size} reclamaci{selected.size > 1 ? "ones" : "\u00f3n"} seleccionada{selected.size > 1 ? "s" : ""}
          </span>
          <button
            onClick={() => { setDeleteTarget(null); setShowDeleteModal(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Eliminar seleccionadas
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Deseleccionar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-surface-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200">
            <thead className="bg-surface-50">
              <tr>
                <th className="px-3 py-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={claims.length > 0 && selected.size === claims.length}
                    onChange={toggleSelectAll}
                    className="rounded border-surface-300 text-brand-700 focus:ring-brand-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Nombre completo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Tel&eacute;fono</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Caso</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">CCAA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Ejercicios</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Docs</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-surface-400">
                    Cargando...
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-surface-400">
                    No se encontraron reclamaciones
                  </td>
                </tr>
              ) : (
                claims.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-surface-50 transition-colors cursor-pointer ${selected.has(c.id) ? "bg-brand-50/30" : ""}`}
                    onClick={() => router.push(`/admin/reclamaciones/${c.id}`)}
                  >
                    <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded border-surface-300 text-brand-700 focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-brand-700 max-w-[160px] truncate hover:underline">
                      <Link href={`/admin/reclamaciones/${c.id}`}>{c.full_name}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600 max-w-[180px] truncate">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">
                      {c.phone || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">
                      {formatCaseSlug(c.case_slug)}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">
                      {c.ccaa || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">
                      {c.ejercicios?.join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={c.status}
                        onChange={(e) => changeStatus(c.id, e.target.value)}
                        disabled={updatingStatus === c.id}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${STATUS_COLORS[c.status] || "bg-surface-100 text-surface-600"}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-400">
                      {new Date(c.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-surface-700">
                      {c.documents?.length || 0}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { setDeleteTarget(c); setShowDeleteModal(true); }}
                        title="Eliminar reclamaci&oacute;n"
                        className="rounded-md p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-surface-500">{total} reclamaciones en total</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="flex items-center px-3 text-sm text-surface-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

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
              <h2 className="text-xl font-bold text-surface-950">
                Eliminar reclamaci{deleteTarget ? "\u00f3n" : "ones"}
              </h2>
              <p className="mt-2 text-sm text-surface-500">
                {deleteTarget
                  ? <>Se eliminar&aacute; permanentemente la reclamaci&oacute;n de <strong className="text-surface-700">{deleteTarget.full_name}</strong>, incluyendo todos los documentos asociados.</>
                  : <>Se eliminar&aacute;n permanentemente <strong className="text-surface-700">{selected.size} reclamaci{selected.size > 1 ? "ones" : "\u00f3n"}</strong>, incluyendo todos los documentos asociados.</>
                }
              </p>
              <p className="mt-2 text-sm font-medium text-red-600">
                Esta acci&oacute;n no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                disabled={deleting}
                className="rounded-lg border border-surface-200 px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
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
