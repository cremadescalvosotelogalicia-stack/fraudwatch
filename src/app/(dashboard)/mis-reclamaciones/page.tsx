import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const CATEGORY_LABELS: Record<string, string> = {
  tax_claims: "Reclamaciones tributarias",
  admin_claims: "Reclamaciones a la Administración",
  consumer_competition: "Consumo & Competencia",
};

const STATUS_LABELS: Record<string, string> = {
  recruiting: "Reclutando afectados",
  open: "Abierto",
  closed: "Cerrado",
  rejected: "Rechazado",
};

const STATUS_STYLES: Record<string, string> = {
  recruiting: "bg-blue-50 text-blue-700 border-blue-200",
  open: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-surface-100 text-surface-600 border-surface-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default async function MisReclamacionesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get all claims for this user with case details
  const { data: claims } = await supabase
    .from("claims")
    .select("id, created_at, case_id, cases(id, title, accused_company, category, status, created_at)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Also get cases created by this user (even without claims)
  const { data: createdCases } = await supabase
    .from("cases")
    .select("id, title, accused_company, category, status, created_at")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  // Merge: all cases from claims + created cases (deduplicated)
  const caseMap = new Map<string, { caseData: Record<string, unknown>; isCreator: boolean; joinedAt: string }>();

  // Add cases from claims
  for (const claim of claims || []) {
    const c = claim.cases as unknown as Record<string, unknown>;
    if (c && c.id) {
      caseMap.set(c.id as string, {
        caseData: c,
        isCreator: false,
        joinedAt: claim.created_at as string,
      });
    }
  }

  // Add/mark created cases
  for (const c of createdCases || []) {
    const existing = caseMap.get(c.id);
    if (existing) {
      existing.isCreator = true;
    } else {
      caseMap.set(c.id, {
        caseData: c as unknown as Record<string, unknown>,
        isCreator: true,
        joinedAt: c.created_at,
      });
    }
  }

  const allCases = Array.from(caseMap.values());

  // Group by category
  const grouped: Record<string, typeof allCases> = {};
  for (const item of allCases) {
    const cat = (item.caseData.category as string) || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const totalCases = allCases.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
          Mis reclamaciones
        </h1>
        <p className="mt-1 text-sm text-surface-900/50">
          {totalCases === 0
            ? "Aún no participas en ninguna reclamación"
            : `Participas en ${totalCases} reclamación${totalCases !== 1 ? "es" : ""}`}
        </p>
      </div>

      {totalCases === 0 ? (
        <div className="rounded-2xl border border-surface-200/80 bg-white p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-surface-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-surface-700">
            No tienes reclamaciones activas
          </h3>
          <p className="mt-2 text-sm text-surface-500">
            Explora los casos disponibles o crea una nueva reclamación.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/cases"
              className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50"
            >
              Ver casos
            </Link>
            <Link
              href="/create"
              className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Crear reclamación
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-surface-800">
                <span className="inline-block h-3 w-3 rounded-full bg-brand-700" />
                {CATEGORY_LABELS[category] || category}
                <span className="text-sm font-normal text-surface-400">
                  ({items.length})
                </span>
              </h2>

              <div className="space-y-3">
                {items.map(({ caseData, isCreator, joinedAt }) => {
                  const status = caseData.status as string;
                  return (
                    <Link
                      key={caseData.id as string}
                      href={`/cases/${caseData.id}`}
                      className="group flex items-center justify-between rounded-xl border border-surface-200/80 bg-white px-5 py-4 transition-all hover:shadow-md hover:border-surface-300"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold text-surface-900 group-hover:text-brand-700">
                            {caseData.accused_company as string}
                          </h3>
                          {isCreator && (
                            <span className="shrink-0 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 border border-purple-200">
                              Creador
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-surface-500">
                          {caseData.title as string}
                        </p>
                        <p className="mt-1 text-xs text-surface-400">
                          Inscrito el{" "}
                          {new Date(joinedAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="ml-4 flex items-center gap-3">
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
                            STATUS_STYLES[status] || "bg-surface-100 text-surface-600 border-surface-200"
                          }`}
                        >
                          {STATUS_LABELS[status] || status}
                        </span>
                        <svg
                          className="h-5 w-5 shrink-0 text-surface-300 group-hover:text-brand-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
