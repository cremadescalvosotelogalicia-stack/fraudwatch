import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { href: string; label: string };
}

export function EmptyState({
  title = "No hay casos disponibles",
  description = "Sé el primero en crear un caso o ajusta los filtros de búsqueda.",
  action = { href: "/create", label: "Crear un caso" },
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-200 bg-surface-50/50 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </div>
      <h3 className="font-display text-lg tracking-tight text-surface-950 mb-2">
        {title}
      </h3>
      <p className="text-sm text-surface-900/45 max-w-sm mb-6">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-700/20 transition-all hover:bg-brand-800"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
