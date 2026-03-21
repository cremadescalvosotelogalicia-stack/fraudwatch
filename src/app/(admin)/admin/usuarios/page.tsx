"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

interface AdminUser {
  id: string;
  alias: string;
  email: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
  claims: { count: number }[];
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null); // single delete

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("q", search);
    if (roleFilter) params.set("role", roleFilter);

    const res = await fetch(`/api/admin/users?${params}`);
    const json = await res.json();
    setUsers(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
    setSelected(new Set());
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function changeRole(userId: string, newRole: string) {
    setUpdatingRole(userId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setUpdatingRole(null);
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    const ids = deleteTarget ? [deleteTarget] : Array.from(selected);

    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    setShowDeleteModal(false);
    setDeleteTarget(null);
    setSelected(new Set());
    setDeleting(false);
    fetchUsers();
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
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.id)));
    }
  }

  async function exportCsv() {
    const params = new URLSearchParams({ format: "csv" });
    if (search) params.set("q", search);
    if (roleFilter) params.set("role", roleFilter);

    const res = await fetch(`/api/admin/users?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-950">Usuarios</h1>
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
          placeholder="Buscar por alias..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Todos los roles</option>
          <option value="client">Cliente</option>
          <option value="admin">Admin</option>
          <option value="supervisor">Supervisor</option>
        </select>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-3">
          <span className="text-sm font-medium text-red-700">
            {selected.size} usuario{selected.size > 1 ? "s" : ""} seleccionado{selected.size > 1 ? "s" : ""}
          </span>
          <button
            onClick={() => { setDeleteTarget(null); setShowDeleteModal(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Eliminar seleccionados
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
                    checked={users.length > 0 && selected.size === users.length}
                    onChange={toggleSelectAll}
                    className="rounded border-surface-300 text-brand-700 focus:ring-brand-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Alias</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Reclamac.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Registro</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-surface-400">
                    Cargando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-surface-400">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className={`hover:bg-surface-50 transition-colors ${selected.has(u.id) ? "bg-brand-50/30" : ""}`}>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selected.has(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        className="rounded border-surface-300 text-brand-700 focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-brand-700 hover:underline">
                      <Link href={`/admin/usuarios/${u.id}`}>{u.alias}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">
                      {u.email || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-surface-700">
                      {u.claims?.[0]?.count || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-400">
                      {new Date(u.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          disabled={updatingRole === u.id}
                          className="rounded-md border border-surface-200 bg-white px-2 py-1 text-xs focus:border-brand-500 focus:outline-none disabled:opacity-50"
                        >
                          <option value="client">Cliente</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(u.id); setShowDeleteModal(true); }}
                          title="Eliminar usuario"
                          className="rounded-md p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
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
          <p className="text-sm text-surface-500">{total} usuarios en total</p>
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
              <h2 className="text-xl font-bold text-surface-950">Eliminar usuario{deleteTarget ? "" : "s"}</h2>
              <p className="mt-2 text-sm text-surface-500">
                {deleteTarget
                  ? <>Se eliminar&aacute; permanentemente el usuario <strong className="text-surface-700">{users.find((u) => u.id === deleteTarget)?.alias || ""}</strong>, incluyendo todas sus reclamaciones y datos asociados.</>
                  : <>Se eliminar&aacute;n permanentemente <strong className="text-surface-700">{selected.size} usuario{selected.size > 1 ? "s" : ""}</strong>, incluyendo todas sus reclamaciones y datos asociados.</>
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

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    supervisor: "bg-blue-100 text-blue-700",
    client: "bg-surface-100 text-surface-600",
  };

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[role] || "bg-surface-100 text-surface-600"}`}>
      {role}
    </span>
  );
}
