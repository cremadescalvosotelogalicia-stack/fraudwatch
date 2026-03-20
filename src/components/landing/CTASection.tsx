import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-brand-700 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
          ¿Has sido víctima de una estafa?
        </h2>
        <p className="mt-4 text-brand-200 text-lg max-w-xl mx-auto">
          Únete a los afectados que ya están organizando su reclamación.
          Registro gratuito, seguro y conforme al RGPD.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50 active:scale-[0.98]"
          >
            Empezar ahora — es gratis
          </Link>
          <Link
            href="/cases"
            className="rounded-xl border border-brand-500 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-600"
          >
            Explorar casos
          </Link>
        </div>
      </div>
    </section>
  );
}
