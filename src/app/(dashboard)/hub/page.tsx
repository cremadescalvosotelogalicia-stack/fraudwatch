import Link from "next/link";

const SECTIONS = [
  {
    title: "Crea tu propia reclamación",
    description:
      "Propón una nueva acción colectiva explicándonos tu caso. Nuestro equipo letrado analizará su viabilidad jurídica y establecerá el número mínimo de afectados que necesitamos reunir para darle luz verde.",
    extra:
      "En esta sección también puedes explorar y unirte a causas en fase de reclutamiento, pendientes de alcanzar el volumen necesario de participantes para activarse.",
    href: "/cases",
    cta: "Acceder",
    icon: "M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "from-brand-700 to-brand-800",
    bgLight: "bg-brand-50",
    textColor: "text-brand-700",
  },
  {
    title: "Consumo y Competencia",
    subtitle: "Acciones Colectivas",
    description:
      "Súmate a reclamaciones activas de consumidores y usuarios frente a abusos corporativos (banca, contratos abusivos, etc.).",
    extra:
      "Participa en demandas conjuntas para reclamar indemnizaciones por los daños y sobrecostes que te han causado las prácticas anticompetitivas del mercado, como los cárteles empresariales o el abuso de posición dominante.",
    href: "/consumo",
    cta: "Acceder",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    color: "from-emerald-600 to-emerald-700",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    comingSoon: true,
  },
  {
    title: "Reclamaciones Masivas",
    subtitle: "Administración y Tributarias",
    description:
      "Únete a casos ya abiertos y en curso contra decisiones injustas de las Administraciones Públicas y reclamaciones tributarias derivadas de sentencias que afectan a una gran mayoría.",
    extra:
      "Representamos a colectivos de trabajadores en litigios laborales, uniendo la fuerza de todos los afectados para exigir la restitución de sus derechos en las diferentes jurisdicciones.",
    href: "/masivas",
    cta: "Acceder",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    color: "from-amber-600 to-amber-700",
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
    comingSoon: true,
  },
];

export default function HubPage() {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-surface-950 sm:text-4xl">
          ¿En qué podemos ayudarte?
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-surface-900/60">
          Selecciona la sección que mejor se adapte a tu situación. Desde tu
          cuenta puedes participar en cualquiera de ellas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="group relative flex flex-col rounded-2xl border border-surface-200/80 bg-white shadow-sm transition-all hover:shadow-lg hover:border-surface-300"
          >
            {/* Header con icono */}
            <div
              className={`flex items-center gap-3 rounded-t-2xl bg-gradient-to-r ${section.color} px-6 py-5`}
            >
              <svg
                className="h-8 w-8 shrink-0 text-white/90"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={section.icon}
                />
              </svg>
              <div>
                <h2 className="text-lg font-bold text-white">{section.title}</h2>
                {section.subtitle && (
                  <p className="text-sm text-white/80">{section.subtitle}</p>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col px-6 py-5">
              <p className="text-sm leading-relaxed text-surface-700">
                {section.description}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-surface-500">
                {section.extra}
              </p>

              <div className="mt-auto pt-6">
                {section.comingSoon ? (
                  <span className="inline-flex w-full items-center justify-center rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-medium text-surface-400">
                    Próximamente
                  </span>
                ) : (
                  <Link
                    href={section.href}
                    className={`inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r ${section.color} px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110`}
                  >
                    {section.cta}
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
