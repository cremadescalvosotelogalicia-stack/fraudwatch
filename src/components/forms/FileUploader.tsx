"use client";

import { useCallback, useState } from "react";

interface UploadedFile {
  name: string;
  size: number;
  storagePath: string;
}

interface FileUploaderProps {
  claimId: string;
  onUploaded?: (files: UploadedFile[]) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
];

export function FileUploader({ claimId, onUploaded }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError("");
      const fileArray = Array.from(files);

      // Validate
      for (const file of fileArray) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(`Tipo de archivo no permitido: ${file.name}`);
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError(`Archivo demasiado grande (máx. 20 MB): ${file.name}`);
          return;
        }
      }

      setUploading(true);

      const results: UploadedFile[] = [];

      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("claim_id", claimId);

        const res = await fetch("/api/evidences/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || `Error al subir ${file.name}`);
          setUploading(false);
          return;
        }

        const data = await res.json();
        results.push({
          name: file.name,
          size: file.size,
          storagePath: data.storage_path,
        });
      }

      setUploaded((prev) => [...prev, ...results]);
      onUploaded?.(results);
      setUploading(false);
    },
    [claimId, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) uploadFiles(e.target.files);
    },
    [uploadFiles]
  );

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragOver
            ? "border-brand-400 bg-brand-50"
            : "border-surface-200 bg-surface-50/50 hover:border-brand-300 hover:bg-brand-50/50"
        }`}
      >
        <input
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileInput}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-surface-900/70">
              {uploading ? "Subiendo archivos..." : "Arrastra archivos o haz clic para seleccionar"}
            </p>
            <p className="text-xs text-surface-900/40 mt-1">
              JPG, PNG, PDF, MP4 · Máx. 20 MB por archivo
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Uploaded list */}
      {uploaded.length > 0 && (
        <div className="space-y-2">
          {uploaded.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-2.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900/80 truncate">{file.name}</p>
                <p className="text-xs text-surface-900/40">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
