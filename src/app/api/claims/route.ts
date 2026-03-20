import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { claimSchema } from "@/lib/validators";
import { sanitizeObject } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const result = claimSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const sanitized = sanitizeObject(result.data);

    // Check if already has a claim on this case
    const { data: existing } = await supabase
      .from("claims")
      .select("id")
      .eq("case_id", sanitized.case_id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Ya tienes un testimonio en este caso" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("claims")
      .insert({
        ...sanitized,
        user_id: user.id,
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
