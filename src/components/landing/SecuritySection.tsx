const pillars = [
  {
    title: "Bucket privado en Supabase Storage",
    description: "Ningún archivo es accesible sin autenticación. Las URLs firmadas expiran en 60 segundos.",
  },
  {
    title: "Row Level Security en PostgreSQL",
    description: "Políticas RLS en todas las tablas. Un usuario solo puede ver y modificar sus propios datos.",
  },
  {
    title: "Sanitización de inputs",
    description: "Todo el texto pasa por DOMPurify server-side antes de llegar a la base de datos.",
  },
  {
    title: "Consentimientos auditables",
    description: "Registro inmutable de cada consentimiento con IP, User-Agent y timestamp. Art. 7.1 RGPD.",
  },
  {
    title: "Borrado físico o anonimización",
    description: "El derecho al olvido implementado según el estado de tus reclamaciones activas.",
  },
  {
    title: "Doble Opt-In en el registro",
    description: "Confirmación de email obligatoria antes de activar la cuenta. Sin excepciones.",
  },
];

export function SecuritySection() {
  return (
    <section className="bg-surface-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">
            Seguridad
          </p>
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Privacy by Design desde los cimientos
          </h2>
          <p className="mt-4 text-surface-400 text-base leading-relaxed">
            No es un complemento, es la arquitectura. Cada decisión técnica
            está tomada con la seguridad y el RGPD como prioridad absoluta.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-surface-800 bg-surface-900/50 p-6"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="font-display text-sm tracking-tight text-white mb-1.5">
                {pillar.title}
              </h3>
              <p className="text-xs text-surface-400 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
