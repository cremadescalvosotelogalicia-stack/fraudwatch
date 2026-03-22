"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback, use } from "react";

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

interface DocFile {
  name: string;
  size: number;
  mimetype: string;
  created_at: string;
  updated_at: string;
}

const MAX_FILES = 6;

export default function MasivaClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [claim, setClaim] = useState<MasivaClaim | null>(null);
  const [documents, setDocuments] = useState<DocFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/reclamaciones/${id}/documents`);
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.data || []);
      }
    } catch {
      // silent
    }
  }, [id]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/reclamaciones");
        if (!res.ok) throw new Error("Error");
        const json = await res.json();
        const found = (json.data as MasivaClaim[]).find(
          (c: MasivaClaim) => c.id === id
        );
        if (!found) {
          setError("Reclamacion no encontrada");
          return;
        }
        setClaim(found);
        await loadDocuments();
      } catch {
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, loadDocuments]);

  async function handleUpload(files: FileList | File[]) {
    if (!claim) return;
    setUploading(true);
    setError("");

    try {
      const fd = new FormData();
      const arr = Array.from(files).slice(0, MAX_FILES);
      for (const file of arr) {
        fd.append("documentos", file);
      }

      const res = await fetch(`/api/user/reclamaciones/${id}/documents`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Error al subir documentos");
      }

      await loadDocuments();
      // Reload claim to get updated documentos count
      const claimRes = await fetch("/api/user/reclamaciones");
      if (claimRes.ok) {
        const json = await claimRes.json();
        const found = (json.data as MasivaClaim[]).find(
          (c: MasivaClaim) => c.id === id
        );
        if (found) setClaim(found);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir documentos"
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(filename: string) {
    setError("");
    try {
      const res = await fetch(`/api/user/reclamaciones/${id}/documents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Error al eliminar");
      }

      setDeleteConfirm(null);
      await loadDocuments();
      // Reload claim
      const claimRes = await fetch("/api/user/reclamaciones");
      if (claimRes.ok) {
        const json = await claimRes.json();
        const found = (json.data as MasivaClaim[]).find(
          (c: MasivaClaim) => c.id === id
        );
        if (found) setClaim(found);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  async function handleDownload(filename: string) {
    try {
      const res = await fetch(
        `/api/user/reclamaciones/${id}/documents/${encodeURIComponent(filename)}`
      );
      if (!res.ok) throw new Error("Error al obtener URL de descarga");
      const json = await res.json();
      window.open(json.url, "_blank");
    } catch {
      setError("Error al descargar el archivo");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleUpload(e.dataTransfer.files);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      handleUpload(e.target.files);
    }
    e.target.value = "";
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-surface-900/40">Cargando...</p>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="space-y-6">
        <Link
          href="/mis-reclamaciones/masivas"
          className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-brand-700 transition-colors"
        >
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
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Volver a mis reclamaciones
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm text-red-700">
            {error || "Reclamacion no encontrada"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        href="/mis-reclamaciones/masivas"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-brand-700 transition-colors"
      >
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
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        Volver a mis reclamaciones
      </Link>

      {/* Claim header card */}
      <div className="rounded-2xl border border-surface-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-surface-950">
              {CASE_LABELS[claim.case_slug] || claim.case_slug}
            </h1>
            <p className="mt-1 text-sm text-surface-500">
              Enviada el{" "}
              {new Date(claim.created_at).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`self-start shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${
              STATUS_STYLES[claim.status] ||
              "bg-surface-100 text-surface-600 border-surface-200"
            }`}
          >
            {STATUS_LABELS[claim.status] || claim.status}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-surface-500">
          <span>CCAA: {claim.comunidad_autonoma}</span>
          <span>Ejercicios: {claim.ejercicios?.join(", ") || "-"}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Documents section */}
      <div className="rounded-2xl border border-surface-200/80 bg-white p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-surface-900">
          Mis documentos
        </h2>

        {/* Document list */}
        {documents.length > 0 ? (
          <ul className="divide-y divide-surface-100">
            {documents.map((doc) => (
              <li
                key={doc.name}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-surface-800">
                    {doc.name}
                  </p>
                  <p className="text-xs text-surface-400">
                    {doc.size ? formatFileSize(doc.size) : ""}{" "}
                    {doc.created_at &&
                      `- ${new Date(doc.created_at).toLocaleDateString(
                        "es-ES",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}`}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(doc.name)}
                    className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-50"
                  >
                    Descargar
                  </button>
                  {deleteConfirm === doc.name ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(doc.name)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(doc.name)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-surface-400">
            No hay documentos subidos para esta reclamacion.
          </p>
        )}

        {/* Upload area */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-surface-700">
            Subir mas documentacion
          </h3>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              dragOver
                ? "border-amber-500 bg-amber-50"
                : "border-surface-200 bg-surface-50 hover:border-surface-300"
            }`}
          >
            <svg
              className="mx-auto h-8 w-8 text-surface-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
            <p className="mt-2 text-sm text-surface-600">
              {uploading
                ? "Subiendo archivos..."
                : (
                    <>
                      Arrastra archivos aqui o{" "}
                      <span className="font-medium text-amber-700">
                        haz clic para seleccionar
                      </span>
                    </>
                  )}
            </p>
            <p className="mt-1 text-xs text-surface-400">
              PDF, JPG, PNG, DOC, DOCX
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              disabled={uploading}
            />
          </div>
        </div>
      </div>

      {/* Hoja de encargo section */}
      <div className="rounded-2xl border border-surface-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">
          Hoja de encargo
        </h2>

        {claim.status === "signed" ? (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <svg
              className="h-5 w-5 shrink-0 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Hoja de encargo firmada
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Tu hoja de encargo ha sido firmada correctamente.
              </p>
            </div>
            <button
              onClick={() => handleDownload("hoja_encargo_firmada.pdf")}
              className="shrink-0 rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700"
            >
              Descargar
            </button>
          </div>
        ) : claim.status === "accepted" ? (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <svg
              className="h-5 w-5 shrink-0 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">
                Pendiente de firma
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Tu solicitud ha sido aceptada. Recibiras la hoja de encargo para
                firmar en breve.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-50 px-5 py-4">
            <svg
              className="h-5 w-5 shrink-0 text-surface-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-surface-700">
                Tu solicitud esta siendo revisada
              </p>
              <p className="text-xs text-surface-500 mt-0.5">
                Nuestro equipo letrado esta revisando tu caso. Te contactaremos
                cuando haya novedades.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
