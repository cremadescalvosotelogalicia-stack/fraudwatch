import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const supabase = createAdminClient();

  const [usersRes, casesRes, claimsRes, evidencesRes, recentUsersRes, recentCasesRes] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("cases").select("*", { count: "exact", head: true }),
      supabase.from("claims").select("*", { count: "exact", head: true }),
      supabase.from("evidences").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id, alias, role, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("cases")
        .select("id, title, status, category, created_at, profiles(alias)")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  // Cases by status
  const { data: casesByStatus } = await supabase
    .from("cases")
    .select("status");

  const statusCounts: Record<string, number> = {};
  casesByStatus?.forEach((c) => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  // Cases by category
  const { data: casesByCategory } = await supabase
    .from("cases")
    .select("category");

  const categoryCounts: Record<string, number> = {};
  casesByCategory?.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  return NextResponse.json({
    totals: {
      users: usersRes.count || 0,
      cases: casesRes.count || 0,
      claims: claimsRes.count || 0,
      documents: evidencesRes.count || 0,
    },
    casesByStatus: statusCounts,
    casesByCategory: categoryCounts,
    recentUsers: recentUsersRes.data || [],
    recentCases: recentCasesRes.data || [],
  });
}
