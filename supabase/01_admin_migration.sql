-- =============================================================
-- MIGRACIÓN: Admin panel + fix RLS recursion
-- Ejecutar en el SQL Editor de Supabase
-- =============================================================

-- ============================================================
-- 1. AÑADIR ROLE A PROFILES
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_role'
  ) THEN
    CREATE TYPE user_role AS ENUM ('client', 'admin', 'supervisor');
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'client';

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================
-- 2. FIX RLS RECURSION — Funciones SECURITY DEFINER
-- ============================================================

-- Función auxiliar para verificar si un usuario tiene claim en un caso
-- Esto evita la recursión infinita entre cases y claims policies
CREATE OR REPLACE FUNCTION public.user_has_claim_on_case(p_case_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.claims
    WHERE case_id = p_case_id AND user_id = p_user_id
  );
$$;

-- Función auxiliar para verificar si un usuario es creator de un caso
CREATE OR REPLACE FUNCTION public.user_is_case_creator(p_case_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cases
    WHERE id = p_case_id AND creator_id = p_user_id
  );
$$;

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
  );
$$;

-- ============================================================
-- 3. REEMPLAZAR POLICIES CON RECURSIÓN
-- ============================================================

-- ---- CASES: Eliminar y recrear SELECT policy ----
DROP POLICY IF EXISTS "cases_select_public" ON public.cases;

CREATE POLICY "cases_select_public"
  ON public.cases FOR SELECT
  USING (
    is_public = TRUE
    OR creator_id = auth.uid()
    OR public.user_has_claim_on_case(id, auth.uid())
    OR public.is_admin()
  );

-- ---- CLAIMS: Eliminar y recrear SELECT policy ----
DROP POLICY IF EXISTS "claims_select_own" ON public.claims;

CREATE POLICY "claims_select_own"
  ON public.claims FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.user_is_case_creator(case_id, auth.uid())
    OR public.is_admin()
  );

-- ============================================================
-- 4. ADMIN BYPASS POLICIES (para ver todo)
-- ============================================================

-- Admins pueden ver todos los perfiles (ya era público, no hace falta)

-- Admins pueden ver todas las evidencias
DROP POLICY IF EXISTS "evidences_select_admin" ON public.evidences;
CREATE POLICY "evidences_select_admin"
  ON public.evidences FOR SELECT
  USING (public.is_admin());

-- Admins pueden ver todos los consent logs
DROP POLICY IF EXISTS "consent_logs_select_admin" ON public.consent_logs;
CREATE POLICY "consent_logs_select_admin"
  ON public.consent_logs FOR SELECT
  USING (public.is_admin());

-- Admins pueden actualizar casos (moderar)
DROP POLICY IF EXISTS "cases_update_admin" ON public.cases;
CREATE POLICY "cases_update_admin"
  ON public.cases FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins pueden insertar casos
DROP POLICY IF EXISTS "cases_insert_admin" ON public.cases;
CREATE POLICY "cases_insert_admin"
  ON public.cases FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================================
-- 5. MARCAR TU USUARIO COMO ADMIN
-- Reemplaza 'TU_EMAIL_AQUÍ' con tu email real
-- ============================================================
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'TU_EMAIL_AQUÍ');
