"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

interface AdminCase {
  id: string;
  title: string;
  accused_company: string;
  category: string;
  status: string;
  is_public: boolean;
  created_at: string;
  profiles: { alias: string } | null;
  claims: { count: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  recruiting: "Reclutando afectados",
  open: "Abierto",
  closed: "Cerrado",
  rejected: "Rechazado",
};

const CATEGORY_LABELS: Record<string, string> = {
  tax_claims: "Reclamaciones tributarias",
  admin_claims: "Reclamaciones a la Administración",
  consumer_competition: "Consumo & Competencia",
};

export default function AdminCasosPage() {
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCase | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("q", search);
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);

    const res = await fetch(`/api/admin/cases?${params}`);
    const json = await res.json();
    setCases(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const totalPages = Math.ceil(total / 20);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/admin/cases/${deleteTarget.id}`, { method: "DELETE" });
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setDeleting(false);
    fetchCases();
  }

  async function exportCsv() {
    const params = new URLSearchParams({ format: "csv" });
    if (search) params.set("q", search);
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);

    const res = await fetch(`/api/admin/cases?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `casos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-950">Casos</h1>
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
          placeholder="Buscar por titulo o empresa..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 w-64"
        />
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
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Todas las categorias</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-surface-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200">
            <thead className="bg-surface-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Titulo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Creador</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Reclamac.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider w-16">
                  <span className="sr-only">Eliminar</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-surface-400">
                    Cargando...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-surface-400">
                    No se encontraron casos
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/casos/${c.id}`}>
                    <td className="px-4 py-3 text-sm font-medium text-brand-700 max-w-[200px] truncate hover:underline">
                      <Link href={`/admin/casos/${c.id}`}>{c.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600 max-w-[150px] truncate">
                      {c.accused_company}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">
                      {CATEGORY_LABELS[c.category] || c.category}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">
                      {c.profiles?.alias || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-surface-700">
                      {c.claims?.[0]?.count || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-400">
                      {new Date(c.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); setShowDeleteModal(true); }}
                        title="Eliminar caso"
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
          <p className="text-sm text-surface-500">
            {total} casos en total
          </p>
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
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-surface-950">Eliminar caso</h2>
              <p className="mt-2 text-sm text-surface-500">
                Se eliminar&aacute; permanentemente el caso <strong className="text-surface-700">&ldquo;{deleteTarget.title}&rdquo;</strong> contra <strong className="text-surface-700">{deleteTarget.accused_company}</strong>, incluyendo todas las reclamaciones asociadas.
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    recruiting: "bg-blue-100 text-blue-700",
    open: "bg-emerald-100 text-emerald-700",
    closed: "bg-surface-100 text-surface-600",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-surface-100 text-surface-600"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
