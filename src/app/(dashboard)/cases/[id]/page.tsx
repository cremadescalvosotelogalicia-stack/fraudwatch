import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ShareLink } from "@/components/cases";
import type { Case, Claim } from "@/types/database";

const categoryLabels: Record<string, string> = {
  investment_fraud: "Fraude de inversion",
  romance_scam: "Estafa romantica",
  phishing: "Phishing",
  ecommerce_fraud: "Fraude en compras",
  rental_fraud: "Fraude de alquiler",
  other: "Otro",
};

const statusLabels: Record<string, string> = {
  recruiting: "Reclutando afectados",
  open: "Abierto",
  closed: "Cerrado",
  rejected: "Rechazado",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: case_ } = await supabase
    .from("cases")
    .select("*, profiles!cases_creator_id_fkey(alias)")
    .eq("id", id)
    .single();

  if (!case_) notFound();

  const typedCase = case_ as unknown as Case & { profiles: { alias: string } };

  // Check access to private case
  if (!typedCase.is_public && typedCase.creator_id !== user?.id) {
    notFound();
  }

  // Get claims for this case
  const { data: claims } = await supabase
    .from("claims")
    .select("*, profiles!claims_user_id_fkey(alias)")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  const isOwner = user?.id === typedCase.creator_id;

  // Check if user already has a claim
  const existingClaim = (claims || []).find((c: Claim) => c.user_id === user?.id);

  const totalAmount = (claims || []).reduce((sum: number, c: Claim) => sum + (c.amount_defrauded || 0), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/cases" className="text-sm text-brand-700 hover:text-brand-800 font-medium">
          &larr; Volver al directorio
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-900/35 mb-1">
              {categoryLabels[typedCase.category] || typedCase.category}
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
              {typedCase.accused_company}
            </h1>
            <p className="text-sm text-surface-900/60 mt-1">{typedCase.title}</p>
          </div>
          <span className="flex-shrink-0 rounded-lg bg-surface-100 px-3 py-1.5 text-xs font-semibold text-surface-700">
            {statusLabels[typedCase.status] || typedCase.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-surface-200/60 bg-white p-6">
        <h2 className="text-sm font-semibold text-surface-950 mb-3">Descripcion del caso</h2>
        <p className="text-sm text-surface-900/60 leading-relaxed whitespace-pre-wrap">
          {typedCase.description}
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-surface-900/35">
          <span>Creado por {typedCase.profiles?.alias || "Anonimo"}</span>
          <span>
            {new Intl.DateTimeFormat("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(typedCase.created_at))}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 text-center">
          <p className="text-2xl font-bold text-surface-950">{(claims || []).length}</p>
          <p className="text-xs text-surface-900/40 mt-1">Afectados</p>
        </div>
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 text-center">
          <p className="text-2xl font-bold text-surface-950">
            {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(totalAmount)}
          </p>
          <p className="text-xs text-surface-900/40 mt-1">Importe total</p>
        </div>
      </div>

      {/* Private case share link */}
      {isOwner && !typedCase.is_public && (
        <ShareLink caseId={typedCase.id} privateToken={typedCase.private_token} />
      )}

      {/* Manage link for owner */}
      {isOwner && (
        <Link
          href={`/cases/${id}/manage`}
          className="block text-center rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
        >
          Gestionar caso
        </Link>
      )}

      {/* Join / add claim */}
      {user && !isOwner && !existingClaim && (typedCase.status === "recruiting" || typedCase.status === "open") && (
        <Link
          href={`/cases/${id}/join`}
          className="block text-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-700/20 hover:bg-brand-800 transition-colors"
        >
          Unirme como afectado
        </Link>
      )}

      {existingClaim && (
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 text-center">
          <p className="text-sm font-semibold text-emerald-700">Ya estas unido a este caso</p>
          <p className="text-xs text-emerald-600/60 mt-1">Tu testimonio fue registrado correctamente</p>
        </div>
      )}

      {/* Claims list */}
      {claims && claims.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-surface-950">
            Testimonios ({claims.length})
          </h2>
          {claims.map((claim: Claim & { profiles?: { alias: string } }) => (
            <div
              key={claim.id}
              className="rounded-2xl border border-surface-200/60 bg-white p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-surface-900/50">
                  {(claim as Claim & { profiles?: { alias: string } }).profiles?.alias || "Anonimo"}
                </span>
                <span className="text-xs text-surface-900/35">
                  {new Intl.DateTimeFormat("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(claim.created_at))}
                </span>
              </div>
              <p className="text-sm text-surface-900/60 leading-relaxed whitespace-pre-wrap">
                {claim.testimony}
              </p>
              <p className="text-xs font-semibold text-surface-950">
                Importe defraudado:{" "}
                {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
                  claim.amount_defrauded
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
