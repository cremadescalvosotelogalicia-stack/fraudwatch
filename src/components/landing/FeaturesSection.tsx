const features = [
  {
    title: "Directorio de casos",
    description:
      "Busca y filtra casos públicos por empresa, categoría o estado. Encuentra si otros afectados ya han organizado una reclamación.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    title: "Casos privados con enlace secreto",
    description:
      "Crea casos privados accesibles solo con un UUID secreto. Comparte solo con afectados de confianza.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Subida segura de pruebas",
    description:
      "Tus documentos van directamente a un bucket privado en Supabase Storage. Nunca son accesibles públicamente.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    title: "URLs firmadas temporales",
    description:
      "El acceso a evidencias se realiza exclusivamente mediante signed URLs generadas en servidor, con expiración automática.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Panel de privacidad ARCO",
    description:
      "Exporta todos tus datos en JSON, revisa tu historial de consentimientos o elimina tu cuenta con un clic.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Row Level Security (RLS)",
    description:
      "Políticas de seguridad a nivel de base de datos. Ningún usuario puede leer datos que no le pertenecen.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 mb-3">
            Funcionalidades
          </p>
          <h2 className="font-display text-3xl tracking-tight text-surface-950 sm:text-4xl">
            Todo lo que necesitas para reclamar con garantías
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-surface-200/60 bg-surface-50/50 p-6 transition-all hover:border-brand-200/60 hover:bg-brand-50/20 hover:shadow-lg hover:shadow-brand-100/30"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                {feature.icon}
              </div>
              <h3 className="font-display text-base tracking-tight text-surface-950 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-surface-900/50 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
