"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

interface AdminDocument {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  user_id: string;
  created_at: string;
  profiles: { alias: string } | null;
  claims: { case_id: string; cases: { title: string } | null } | null;
}

export default function AdminDocumentosPage() {
  const [docs, setDocs] = useState<AdminDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mimeFilter, setMimeFilter] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (mimeFilter) params.set("mimeType", mimeFilter);

    const res = await fetch(`/api/admin/documents?${params}`);
    const json = await res.json();
    setDocs(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [page, mimeFilter]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  async function downloadFile(storagePath: string, fileName: string) {
    setDownloading(storagePath);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath }),
      });
      const { url } = await res.json();
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.target = "_blank";
        a.click();
      }
    } catch {
      // ignore
    }
    setDownloading(null);
  }

  async function exportCsv() {
    const params = new URLSearchParams({ format: "csv" });
    if (mimeFilter) params.set("mimeType", mimeFilter);

    const res = await fetch(`/api/admin/documents?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documentos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / 20);

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function mimeIcon(mime: string): string {
    if (mime.startsWith("image/")) return "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z";
    if (mime === "application/pdf") return "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";
    if (mime.startsWith("video/")) return "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z";
    return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-950">Documentos</h1>
        <button
          onClick={exportCsv}
          className="rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-200 transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={mimeFilter}
          onChange={(e) => { setMimeFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Todos los tipos</option>
          <option value="image/">Imagenes</option>
          <option value="application/pdf">PDF</option>
          <option value="video/">Videos</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-surface-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200">
            <thead className="bg-surface-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Archivo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Tamano</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Caso</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Descargar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-surface-400">
                    Cargando...
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-surface-400">
                    No se encontraron documentos
                  </td>
                </tr>
              ) : (
                docs.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-surface-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d={mimeIcon(d.mime_type)} />
                        </svg>
                        <span className="text-sm font-medium text-surface-900 max-w-[200px] truncate">
                          {d.file_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-500 font-mono">{d.mime_type}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{formatSize(d.file_size)}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{d.profiles?.alias || "-"}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 max-w-[150px] truncate">
                      {d.claims?.cases?.title || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-400">
                      {new Date(d.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => downloadFile(d.storage_path, d.file_name)}
                        disabled={downloading === d.storage_path}
                        className="rounded-md bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50"
                      >
                        {downloading === d.storage_path ? "..." : "Descargar"}
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
          <p className="text-sm text-surface-500">{total} documentos en total</p>
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
    </AdminShell>
  );
}
