-- =============================================================
-- FRAUDWATCH — Schema SQL completo
-- Ejecutar en orden en el SQL Editor de Supabase
-- =============================================================

-- ============================================================
-- 1. EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. TIPOS PERSONALIZADOS
-- ============================================================
CREATE TYPE case_status AS ENUM (
  'open',
  'under_review',
  'closed',
  'won',
  'lost'
);

CREATE TYPE case_category AS ENUM (
  'investment_fraud',
  'romance_scam',
  'phishing',
  'ecommerce_fraud',
  'rental_fraud',
  'other'
);

CREATE TYPE consent_type AS ENUM (
  'terms_of_service',
  'privacy_policy',
  'data_sharing_legal_team',
  'cookie_consent'
);

-- ============================================================
-- 3. TABLAS
-- ============================================================

-- Perfiles (extiende auth.users)
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias        TEXT NOT NULL UNIQUE,
  avatar_url   TEXT,
  is_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Casos
CREATE TABLE public.cases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL CHECK (length(title) >= 10 AND length(title) <= 120),
  accused_company  TEXT NOT NULL CHECK (length(accused_company) >= 2),
  description      TEXT NOT NULL CHECK (length(description) >= 50),
  category         case_category NOT NULL DEFAULT 'other',
  status           case_status NOT NULL DEFAULT 'open',
  is_public        BOOLEAN NOT NULL DEFAULT TRUE,
  private_token    UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reclamaciones (pivot usuario-caso)
CREATE TABLE public.claims (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id           UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_defrauded  NUMERIC(12, 2) NOT NULL CHECK (amount_defrauded > 0),
  testimony         TEXT NOT NULL CHECK (length(testimony) >= 20),
  share_with_legal  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, user_id)
);

-- Evidencias
CREATE TABLE public.evidences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id      UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  file_size     BIGINT NOT NULL CHECK (file_size > 0),
  mime_type     TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registro inmutable de consentimientos (RGPD Art. 7)
CREATE TABLE public.consent_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  consent_type      consent_type NOT NULL,
  document_version  TEXT NOT NULL,
  accepted          BOOLEAN NOT NULL,
  ip_address        TEXT NOT NULL,
  user_agent        TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. ÍNDICES
-- ============================================================
CREATE INDEX idx_cases_creator_id ON public.cases(creator_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_category ON public.cases(category);
CREATE INDEX idx_cases_is_public ON public.cases(is_public);
CREATE INDEX idx_claims_case_id ON public.claims(case_id);
CREATE INDEX idx_claims_user_id ON public.claims(user_id);
CREATE INDEX idx_evidences_claim_id ON public.evidences(claim_id);
CREATE INDEX idx_evidences_user_id ON public.evidences(user_id);
CREATE INDEX idx_consent_logs_user_id ON public.consent_logs(user_id);

-- ============================================================
-- 5. TRIGGERS — updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_claims_updated_at
  BEFORE UPDATE ON public.claims
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: crear perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, alias)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'alias', 'user_' || substr(NEW.id::text, 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidences   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- CASES ----
CREATE POLICY "cases_select_public"
  ON public.cases FOR SELECT
  USING (
    is_public = TRUE
    OR creator_id = auth.uid()
    OR id IN (
      SELECT case_id FROM public.claims WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "cases_insert_authenticated"
  ON public.cases FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "cases_update_creator"
  ON public.cases FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "cases_delete_creator"
  ON public.cases FOR DELETE
  USING (auth.uid() = creator_id);

-- ---- CLAIMS ----
CREATE POLICY "claims_select_own"
  ON public.claims FOR SELECT
  USING (
    user_id = auth.uid()
    OR case_id IN (
      SELECT id FROM public.cases WHERE creator_id = auth.uid()
    )
  );

CREATE POLICY "claims_insert_authenticated"
  ON public.claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "claims_update_own"
  ON public.claims FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "claims_delete_own"
  ON public.claims FOR DELETE
  USING (auth.uid() = user_id);

-- ---- EVIDENCES ----
CREATE POLICY "evidences_select_own"
  ON public.evidences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "evidences_insert_own"
  ON public.evidences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "evidences_delete_own"
  ON public.evidences FOR DELETE
  USING (auth.uid() = user_id);

-- ---- CONSENT_LOGS ----
CREATE POLICY "consent_logs_select_own"
  ON public.consent_logs FOR SELECT
  USING (user_id = auth.uid());

-- INSERT is handled by service_role only (no user policy for insert)
-- to maintain immutability from the client side

-- ============================================================
-- 7. FUNCIONES RPC
-- ============================================================

-- Función export_my_data (portabilidad RGPD Art. 20)
CREATE OR REPLACE FUNCTION public.export_my_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT json_build_object(
    'exported_at', NOW(),
    'user_id', v_user_id,
    'profile', (
      SELECT row_to_json(p) FROM public.profiles p WHERE p.id = v_user_id
    ),
    'cases_created', (
      SELECT json_agg(c) FROM public.cases c WHERE c.creator_id = v_user_id
    ),
    'claims', (
      SELECT json_agg(cl) FROM public.claims cl WHERE cl.user_id = v_user_id
    ),
    'evidences', (
      SELECT json_agg(e) FROM public.evidences e WHERE e.user_id = v_user_id
    ),
    'consent_logs', (
      SELECT json_agg(clog) FROM public.consent_logs clog WHERE clog.user_id = v_user_id
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================
-- 8. STORAGE — Bucket privado para evidencias
-- ============================================================

-- Crear bucket privado (ejecutar desde el dashboard o con service_role)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidences',
  'evidences',
  FALSE,
  20971520, -- 20 MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: solo el propietario puede ver sus archivos
CREATE POLICY "storage_evidences_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'evidences'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_evidences_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'evidences'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_evidences_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'evidences'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
