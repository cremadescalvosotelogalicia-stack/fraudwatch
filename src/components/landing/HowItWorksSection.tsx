const steps = [
  {
    step: "01",
    title: "Regístrate de forma segura",
    description:
      "Crea tu cuenta con confirmación por email (doble opt-in). Solo necesitas un alias, tu identidad real permanece protegida.",
  },
  {
    step: "02",
    title: "Encuentra o crea un caso",
    description:
      "Busca si ya existe un caso contra la empresa que te estafó. Si no, créalo tú. Puedes hacerlo público o privado con enlace secreto.",
  },
  {
    step: "03",
    title: "Aporta tu testimonio y pruebas",
    description:
      "Documenta el importe estafado, tu relato y sube documentos (recibos, capturas, emails) a nuestro bucket privado cifrado.",
  },
  {
    step: "04",
    title: "Actúa colectivamente",
    description:
      "Con múltiples afectados documentados, la fuerza legal es mayor. Exporta tus datos cuando quieras o ejerce tu derecho al olvido.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-surface-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 mb-3">
            Cómo funciona
          </p>
          <h2 className="font-display text-3xl tracking-tight text-surface-950 sm:text-4xl">
            De víctima a reclamante en cuatro pasos
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.step} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute top-6 left-12 hidden h-px w-full bg-gradient-to-r from-brand-200 to-transparent lg:block" />
              )}

              <div className="relative flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-sm font-bold text-white">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-display text-lg tracking-tight text-surface-950 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-surface-900/50 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
