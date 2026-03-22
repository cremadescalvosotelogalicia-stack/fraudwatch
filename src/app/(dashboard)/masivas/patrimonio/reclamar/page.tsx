"use client";

import Link from "next/link";
import { useState, useRef, type FormEvent, type ChangeEvent } from "react";

const COMUNIDADES = [
  "Galicia",
  "Cataluña",
  "Comunidad Valenciana",
  "Islas Baleares",
  "Asturias",
  "Cantabria",
  "Aragón",
  "Canarias",
  "Extremadura",
  "Región de Murcia",
  "Castilla y León",
  "Castilla-La Mancha",
  "La Rioja",
  "Madrid",
  "Andalucía",
  "Navarra",
  "País Vasco",
];

const EJERCICIOS = ["2021", "2022"];

const MAX_FILES = 6;

export default function ReclamarPatrimonioPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedEjercicios, setSelectedEjercicios] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleEjercicioToggle(year: string) {
    setSelectedEjercicios((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  }

  function handleFiles(incoming: FileList | File[]) {
    const arr = Array.from(incoming);
    setFiles((prev) => {
      const combined = [...prev, ...arr];
      return combined.slice(0, MAX_FILES);
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (selectedEjercicios.length === 0) {
      setError("Debes seleccionar al menos un ejercicio a reclamar.");
      return;
    }

    const form = e.currentTarget;
    const privacyCheckbox = form.querySelector<HTMLInputElement>(
      'input[name="privacy_accepted"]'
    );
    if (!privacyCheckbox?.checked) {
      setError("Debes aceptar la política de privacidad.");
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("case_slug", "patrimonio");
      fd.append("nombre", (form.elements.namedItem("nombre") as HTMLInputElement).value);
      fd.append("apellidos", (form.elements.namedItem("apellidos") as HTMLInputElement).value);
      fd.append("email", (form.elements.namedItem("email") as HTMLInputElement).value);
      fd.append("telefono", (form.elements.namedItem("telefono") as HTMLInputElement).value);
      fd.append(
        "comunidad_autonoma",
        (form.elements.namedItem("comunidad_autonoma") as HTMLSelectElement).value
      );
      for (const ej of selectedEjercicios) {
        fd.append("ejercicios", ej);
      }
      fd.append(
        "comentarios",
        (form.elements.namedItem("comentarios") as HTMLTextAreaElement).value
      );
      fd.append("privacy_accepted", "true");
      for (const file of files) {
        fd.append("documentos", file);
      }

      const res = await fetch("/api/masivas/claims", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Error al enviar la solicitud");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al enviar la solicitud");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <Link href="/hub" className="hover:text-brand-700 transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/masivas" className="hover:text-brand-700 transition-colors">
            Reclamaciones Masivas
          </Link>
          <span>/</span>
          <span className="text-surface-900">Patrimonio</span>
        </div>

        <div className="mx-auto max-w-xl rounded-2xl border border-surface-200/80 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-surface-950">
            Solicitud enviada correctamente
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-surface-600">
            Hemos recibido tu solicitud de reclamaci&oacute;n para la Devoluci&oacute;n del Impuesto
            sobre el Patrimonio. Nuestro equipo letrado revisar&aacute; tu caso y se pondr&aacute;
            en contacto contigo en las pr&oacute;ximas 48 horas.
          </p>
          <p className="mt-2 text-sm text-surface-500">
            Hemos enviado un correo de confirmaci&oacute;n a tu direcci&oacute;n de email.
          </p>
          <Link
            href="/masivas"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
          >
            Volver a Reclamaciones Masivas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-surface-500">
        <Link href="/hub" className="hover:text-brand-700 transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/masivas" className="hover:text-brand-700 transition-colors">
          Reclamaciones Masivas
        </Link>
        <span>/</span>
        <span>Patrimonio</span>
        <span>/</span>
        <span className="text-surface-900">Reclamar</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950 sm:text-3xl">
          Solicita tu an&aacute;lisis de viabilidad gratuito
        </h1>
        <p className="mt-2 text-base text-surface-900/50">
          Devoluci&oacute;n del Impuesto sobre el Patrimonio
        </p>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-surface-200/80 bg-white p-6 shadow-sm sm:p-8 space-y-6"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Nombre + Apellidos */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-surface-700 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 focus:outline-none transition-colors"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label
              htmlFor="apellidos"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Apellidos <span className="text-red-500">*</span>
            </label>
            <input
              id="apellidos"
              name="apellidos"
              type="text"
              required
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 focus:outline-none transition-colors"
              placeholder="Tus apellidos"
            />
          </div>
        </div>

        {/* Email + Teléfono */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
              Correo electr&oacute;nico <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 focus:outline-none transition-colors"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-surface-700 mb-1.5">
              Tel&eacute;fono <span className="text-red-500">*</span>
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              required
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 focus:outline-none transition-colors"
              placeholder="600 123 456"
            />
          </div>
        </div>

        {/* Comunidad Autónoma */}
        <div>
          <label
            htmlFor="comunidad_autonoma"
            className="block text-sm font-medium text-surface-700 mb-1.5"
          >
            Comunidad Aut&oacute;noma donde has tributado <span className="text-red-500">*</span>
          </label>
          <select
            id="comunidad_autonoma"
            name="comunidad_autonoma"
            required
            className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 focus:outline-none transition-colors"
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona tu comunidad aut&oacute;noma
            </option>
            {COMUNIDADES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Ejercicios */}
        <fieldset>
          <legend className="block text-sm font-medium text-surface-700 mb-2">
            A&ntilde;os reclamados <span className="text-red-500">*</span>
          </legend>
          <div className="flex gap-4">
            {EJERCICIOS.map((year) => (
              <label
                key={year}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  selectedEjercicios.includes(year)
                    ? "border-amber-600 bg-amber-50 text-amber-800"
                    : "border-surface-200 bg-surface-50 text-surface-700 hover:border-surface-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedEjercicios.includes(year)}
                  onChange={() => handleEjercicioToggle(year)}
                  className="sr-only"
                />
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    selectedEjercicios.includes(year)
                      ? "border-amber-600 bg-amber-600"
                      : "border-surface-300 bg-white"
                  }`}
                >
                  {selectedEjercicios.includes(year) && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  )}
                </span>
                Ejercicio {year}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Documentación */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            Documentaci&oacute;n
          </label>
          <p className="mb-3 text-xs leading-relaxed text-surface-500">
            Sube aqu&iacute; las autoliquidaciones de los a&ntilde;os que reclamas (2021 - 2022) y
            los justificantes de pago de dichos ejercicios. Si no los tienes a mano o todav&iacute;a
            no te has decidido a reclamar, no te preocupes, podr&aacute;s enviarlos m&aacute;s tarde
            por email.
          </p>
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
              Arrastra archivos aqu&iacute; o{" "}
              <span className="font-medium text-amber-700">haz clic para seleccionar</span>
            </p>
            <p className="mt-1 text-xs text-surface-400">M&aacute;ximo {MAX_FILES} archivos</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </div>

          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm"
                >
                  <span className="truncate text-surface-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="ml-2 shrink-0 text-surface-400 hover:text-red-600 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Comentarios */}
        <div>
          <label
            htmlFor="comentarios"
            className="block text-sm font-medium text-surface-700 mb-1.5"
          >
            Comentarios
          </label>
          <textarea
            id="comentarios"
            name="comentarios"
            rows={4}
            className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 focus:outline-none transition-colors resize-none"
            placeholder="A&ntilde;ade cualquier informaci&oacute;n adicional que consideres relevante..."
          />
        </div>

        {/* Privacidad */}
        <div className="flex items-start gap-3">
          <input
            id="privacy_accepted"
            name="privacy_accepted"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-surface-300 text-amber-600 focus:ring-amber-600"
          />
          <label htmlFor="privacy_accepted" className="text-sm text-surface-600">
            He le&iacute;do y acepto la{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-700 underline hover:text-amber-800"
            >
              pol&iacute;tica de privacidad
            </a>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Enviando solicitud..." : "Enviar solicitud de reclamaci\u00f3n"}
        </button>
      </form>
    </div>
  );
}
