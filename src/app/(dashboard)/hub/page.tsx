import Link from "next/link";

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
        {/* ── BLOQUE 1: Crea tu propia reclamación ── */}
        <div className="group relative flex flex-col rounded-2xl border border-surface-200/80 bg-white shadow-sm transition-all hover:shadow-lg hover:border-surface-300">
          <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-brand-700 to-brand-800 px-6 py-5">
            <svg className="h-8 w-8 shrink-0 text-white/90" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h2 className="text-lg font-bold text-white">Crea tu propia reclamación</h2>
            </div>
          </div>
          <div className="flex flex-1 flex-col px-6 py-5">
            <p className="text-sm leading-relaxed text-surface-700">
              Propón una nueva acción colectiva explicándonos tu caso. Nuestro equipo letrado analizará su viabilidad jurídica y establecerá el número mínimo de afectados que necesitamos reunir para darle luz verde.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-surface-500">
              En esta sección también puedes explorar y unirte a causas en fase de reclutamiento, pendientes de alcanzar el volumen necesario de participantes para activarse.
            </p>
            <div className="mt-auto pt-6">
              <Link
                href="/cases"
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-700 to-brand-800 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
              >
                Acceder
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── BLOQUE 2: Consumo y Competencia (próximamente) ── */}
        <div className="group relative flex flex-col rounded-2xl border border-surface-200/80 bg-white shadow-sm transition-all hover:shadow-lg hover:border-surface-300">
          <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5">
            <svg className="h-8 w-8 shrink-0 text-white/90" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            <div>
              <h2 className="text-lg font-bold text-white">Consumo y Competencia</h2>
              <p className="text-sm text-white/80">Acciones Colectivas</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col px-6 py-5">
            <p className="text-sm leading-relaxed text-surface-700">
              Súmate a reclamaciones activas de consumidores y usuarios frente a abusos corporativos (banca, contratos abusivos, etc.).
            </p>
            <p className="mt-3 text-sm leading-relaxed text-surface-500">
              Participa en demandas conjuntas para reclamar indemnizaciones por los daños y sobrecostes que te han causado las prácticas anticompetitivas del mercado, como los cárteles empresariales o el abuso de posición dominante.
            </p>
            <div className="mt-auto pt-6">
              <span className="inline-flex w-full items-center justify-center rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-medium text-surface-400">
                Próximamente
              </span>
            </div>
          </div>
        </div>

        {/* ── BLOQUE 3: Reclamaciones Masivas (ACTIVO) ── */}
        <div className="group relative flex flex-col rounded-2xl border border-surface-200/80 bg-white shadow-sm transition-all hover:shadow-lg hover:border-surface-300">
          <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-5">
            <svg className="h-8 w-8 shrink-0 text-white/90" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div>
              <h2 className="text-lg font-bold text-white">Reclamaciones Masivas</h2>
              <p className="text-sm text-white/80">Administración y Tributarias</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col px-6 py-5">
            <p className="text-sm leading-relaxed text-surface-700">
              Únete a casos ya abiertos y en curso contra decisiones injustas de las Administraciones Públicas y reclamaciones tributarias derivadas de sentencias que afectan a una gran mayoría.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-surface-500">
              Representamos a colectivos afectados, uniendo la fuerza de todos para exigir la restitución de sus derechos en las diferentes jurisdicciones.
            </p>
            <div className="mt-auto pt-6">
              <Link
                href="/masivas"
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
              >
                Acceder
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
