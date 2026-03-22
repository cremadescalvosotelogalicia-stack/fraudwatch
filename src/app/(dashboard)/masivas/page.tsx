import Link from "next/link";

const ACTIVE_CASES = [
  {
    id: "deduccion-irpf-hipoteca",
    title: "Deducción IRPF por cancelación de hipoteca",
    company: "Agencia Tributaria (AEAT)",
    description:
      "Basado en la Resolución TEAC 00/02995/2025. El Tribunal Económico-Administrativo Central permite deducir en IRPF el dinero usado para cancelar hipotecas al vender la vivienda habitual.",
    highlights: [
      "Recupera hasta 1.356 \u20ac por titular y ejercicio",
      "Ejercicios reclamables: 2020, 2021, 2022 y 2023",
      "Vivienda comprada antes del 01/01/2013",
    ],
    tag: "Reclamación tributaria",
    status: "Activo",
    url: "https://crowdlitigations.com/reclamaciones-tributarias/deduccion-irpf-cancelacion-hipoteca/",
  },
  {
    id: "devolucion-patrimonio",
    title: "Devolución del Impuesto sobre el Patrimonio",
    company: "Hacienda Autonómica",
    description:
      "El Tribunal Constitucional dictará sentencia en 2026 sobre la posible inconstitucionalidad del Impuesto de Patrimonio por confiscatoriedad. Solo recuperarán su dinero quienes hayan reclamado antes del fallo.",
    highlights: [
      "Ejercicios 2021 y 2022",
      "Prescripción del ejercicio 2021: junio 2026",
      "Recuperación de cuota + intereses de demora (~4% anual)",
    ],
    tag: "Reclamación tributaria",
    status: "Urgente",
    url: "https://crowdlitigations.com/reclamaciones-tributarias/devolucion-impuesto-patrimonio/",
  },
];

export default function MasivasPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-4">
          <Link href="/hub" className="hover:text-brand-700 transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-surface-900">Reclamaciones Masivas</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950 sm:text-3xl">
          Reclamaciones Masivas
        </h1>
        <p className="mt-2 text-base text-surface-900/50">
          Casos abiertos y en curso dirigidos por el equipo letrado de Cremades &amp; Calvo-Sotelo.
          Únete a las reclamaciones que te afecten.
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-amber-800">
            Estas reclamaciones están dirigidas íntegramente por nuestro equipo letrado.
            Al unirte, un abogado se pondrá en contacto contigo para gestionar tu caso de forma personalizada.
          </p>
        </div>
      </div>

      {/* Cases grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {ACTIVE_CASES.map((caso) => (
          <div
            key={caso.id}
            className="flex flex-col rounded-2xl border border-surface-200/80 bg-white shadow-sm transition-all hover:shadow-lg hover:border-surface-300 overflow-hidden"
          >
            {/* Card header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                  {caso.tag}
                </span>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    caso.status === "Urgente"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {caso.status}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-bold text-white leading-snug">
                {caso.title}
              </h2>
              <p className="mt-1 text-sm text-white/70">
                contra {caso.company}
              </p>
            </div>

            {/* Card body */}
            <div className="flex flex-1 flex-col px-6 py-5">
              <p className="text-sm leading-relaxed text-surface-700">
                {caso.description}
              </p>

              {/* Highlights */}
              <ul className="mt-4 space-y-2">
                {caso.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-surface-600">{h}</span>
                  </li>
                ))}
              </ul>

              {/* Actions */}
              <div className="mt-auto pt-6 flex flex-col gap-2">
                {caso.id === "devolucion-patrimonio" ? (
                  <>
                    <Link
                      href="/masivas/patrimonio/reclamar"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
                    >
                      Reclama ya
                      <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                    <a
                      href={caso.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm font-semibold text-surface-700 transition-all hover:bg-surface-50 hover:border-surface-300"
                    >
                      Más información
                      <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </>
                ) : (
                  <a
                    href={caso.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
                  >
                    Más información
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact footer */}
      <div className="rounded-xl border border-surface-200/80 bg-white p-6 text-center">
        <h3 className="text-lg font-semibold text-surface-900">¿Tienes dudas sobre alguna reclamación?</h3>
        <p className="mt-2 text-sm text-surface-500">
          Nuestro equipo puede asesorarte sin compromiso.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href="tel:981925637"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200 px-5 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            981 92 56 37
          </a>
          <a
            href="mailto:info@crowdlitigations.com"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200 px-5 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            info@crowdlitigations.com
          </a>
        </div>
      </div>
    </div>
  );
}
