import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CaseCard, CaseFilters, Pagination, EmptyState } from "@/components/cases";
import type { Case } from "@/types/database";

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export default async function CasesPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("cases")
    .select("*, profiles!cases_creator_id_fkey(alias), claims(count)", { count: "exact" })
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q) {
    query = query.or(`title.ilike.%${q}%,accused_company.ilike.%${q}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }

  const { data: cases, count } = await query;

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
          Directorio de casos
        </h1>
        <p className="mt-1 text-sm text-surface-900/50">
          {count || 0} casos publicos registrados
        </p>
      </div>

      <CaseFilters />

      {cases && cases.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => (
              <CaseCard key={c.id} case_={c as unknown as Case} />
            ))}
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} />}
        </>
      ) : (
        <EmptyState
          title="No se encontraron casos"
          description={q ? "Prueba con otros terminos de busqueda" : "Se el primero en crear un caso"}
        />
      )}
    </div>
  );
}
