import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[1200px] rounded-full bg-brand-50/60 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50 px-4 py-1.5 text-xs font-medium text-brand-700 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Plataforma con cumplimiento RGPD · Privacy by Design
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl tracking-tight text-surface-950 sm:text-5xl lg:text-6xl">
            Organízate contra el fraude.{" "}
            <span className="text-brand-700">Juntos somos más fuertes.</span>
          </h1>

          <p className="mt-6 text-lg text-surface-900/55 leading-relaxed max-w-2xl mx-auto">
            FraudWatch es la plataforma para víctimas de estafas que permite
            unirse colectivamente, documentar pruebas de forma segura y ejercer
            derechos legales con plenas garantías de privacidad.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-brand-700 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition-all hover:bg-brand-800 hover:shadow-xl active:scale-[0.98]"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/cases"
              className="rounded-xl border border-surface-200 px-8 py-3.5 text-sm font-semibold text-surface-900/70 transition-all hover:bg-surface-50 hover:border-surface-300"
            >
              Ver casos activos
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: "🔒", label: "Cifrado extremo a extremo" },
              { icon: "🇪🇺", label: "RGPD compliant" },
              { icon: "🛡️", label: "Bucket privado" },
              { icon: "⚖️", label: "Derechos ARCO" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-sm text-surface-900/50">
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
