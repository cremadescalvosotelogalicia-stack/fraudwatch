"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { signOut } from "@/lib/auth-actions";
import { InputField, SubmitButton, Alert } from "@/components/forms/AuthFields";
import type { Profile } from "@/types/database";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [alias, setAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as unknown as Profile);
        setAlias(data.alias || "");
      }
    }
    load();
  }, [supabase]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (alias.length < 3) {
      setError("El alias debe tener al menos 3 caracteres");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ alias })
      .eq("id", user!.id);

    if (updateError) {
      setError("Error al actualizar el perfil");
    } else {
      setSuccess("Perfil actualizado correctamente");
    }
    setLoading(false);
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-surface-900/40">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-surface-950">
          Mi perfil
        </h1>
        <p className="mt-1 text-sm text-surface-900/50">
          Gestiona tu cuenta y preferencias de privacidad
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Profile form */}
      <form onSubmit={handleUpdate} className="rounded-2xl border border-surface-200/60 bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold text-surface-950">Datos de la cuenta</h2>

        <InputField
          label="Alias publico"
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-900/70">
            Verificado
          </label>
          <p className="text-sm text-surface-900/50">
            {profile.is_verified ? "Si" : "No"} verificado
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-900/70">
            Miembro desde
          </label>
          <p className="text-sm text-surface-900/50">
            {new Intl.DateTimeFormat("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(profile.created_at))}
          </p>
        </div>

        <SubmitButton loading={loading} loadingText="Guardando...">
          Guardar cambios
        </SubmitButton>
      </form>

      {/* Privacy */}
      <Link
        href="/profile/privacy"
        className="block rounded-2xl border border-surface-200/60 bg-white p-6 hover:border-brand-200/60 hover:shadow-lg hover:shadow-brand-100/30 transition-all"
      >
        <h2 className="text-sm font-semibold text-surface-950">Privacidad y datos (RGPD)</h2>
        <p className="text-sm text-surface-900/50 mt-1">
          Exporta o elimina tus datos, gestiona consentimientos
        </p>
      </Link>

      {/* Sign out */}
      <form action={signOut}>
        <button
          type="submit"
          className="w-full rounded-xl border border-surface-200 px-4 py-3 text-sm font-semibold text-surface-900/70 hover:bg-surface-50 transition-colors"
        >
          Cerrar sesion
        </button>
      </form>
    </div>
  );
}
