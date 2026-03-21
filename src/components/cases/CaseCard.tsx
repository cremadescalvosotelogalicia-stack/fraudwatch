import Link from "next/link";
import type { Case } from "@/types/database";

const categoryLabels: Record<string, string> = {
  investment_fraud: "Fraude de inversión",
  romance_scam: "Estafa romántica",
  phishing: "Phishing",
  ecommerce_fraud: "Fraude en compras",
  rental_fraud: "Fraude de alquiler",
  other: "Otro",
};

const statusStyles: Record<string, string> = {
  recruiting: "bg-blue-50 text-blue-700",
  open: "bg-emerald-50 text-emerald-700",
  closed: "bg-surface-100 text-surface-500",
  rejected: "bg-red-50 text-red-600",
};

const statusLabels: Record<string, string> = {
  recruiting: "Reclutando afectados",
  open: "Abierto",
  closed: "Cerrado",
  rejected: "Rechazado",
};

interface CaseCardProps {
  case_: Case;
}

export function CaseCard({ case_ }: CaseCardProps) {
  const claimCount =
    Array.isArray(case_.claims) && case_.claims[0]
      ? (case_.claims[0] as { count: number }).count
      : 0;

  return (
    <Link
      href={`/cases/${case_.id}`}
      className="group block rounded-2xl border border-surface-200/60 bg-white p-6 transition-all hover:border-brand-200/60 hover:shadow-lg hover:shadow-brand-100/30"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-surface-900/35 mb-1">
            {categoryLabels[case_.category] || case_.category}
          </p>
          <h3 className="font-display text-base tracking-tight text-surface-950 truncate group-hover:text-brand-700 transition-colors">
            {case_.accused_company}
          </h3>
        </div>
        <span
          className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${statusStyles[case_.status] || statusStyles.open}`}
        >
          {statusLabels[case_.status] || case_.status}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm text-surface-900/60 line-clamp-2 mb-4 leading-relaxed">
        {case_.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-surface-900/35">
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>{claimCount} {claimCount === 1 ? "afectado" : "afectados"}</span>
        </div>
        <span>
          {new Intl.DateTimeFormat("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(new Date(case_.created_at))}
        </span>
      </div>
    </Link>
  );
}
