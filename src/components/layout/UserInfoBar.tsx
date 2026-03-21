import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function UserInfoBar() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("alias, role")
    .eq("id", user.id)
    .single();

  const displayName = profile?.alias || user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
  const email = user.email || "";
  const provider = user.app_metadata?.provider || "email";
  const role = profile?.role || "client";

  return (
    <div className="border-b border-surface-200/60 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900">{displayName}</p>
            <p className="text-xs text-surface-500">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {provider !== "email" && (
            <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-500 capitalize">
              {provider}
            </span>
          )}
          {role !== "client" && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 capitalize">
              {role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
