import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { caseSchema } from "@/lib/validators";
import { sanitizeObject } from "@/lib/sanitize";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("cases")
    .select("*, profiles!cases_creator_id_fkey(alias), claims(count)", { count: "exact" })
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const q = searchParams.get("q");
  if (q) {
    query = query.or(`title.ilike.%${q}%,accused_company.ilike.%${q}%`);
  }

  const category = searchParams.get("category");
  if (category) {
    query = query.eq("category", category);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const result = caseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const sanitized = sanitizeObject(result.data);

    const { data, error } = await supabase
      .from("cases")
      .insert({
        ...sanitized,
        creator_id: user.id,
        status: "open",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
