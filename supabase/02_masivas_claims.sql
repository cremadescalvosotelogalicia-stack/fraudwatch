-- Table for mass litigation claims (Reclamaciones Masivas)
CREATE TABLE IF NOT EXISTS masivas_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL, -- e.g. 'patrimonio', 'irpf-hipoteca'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  comunidad_autonoma TEXT NOT NULL,
  ejercicios TEXT[] NOT NULL, -- ['2021', '2022']
  comentarios TEXT DEFAULT '',
  documentos TEXT[] DEFAULT '{}', -- array of storage paths
  privacy_accepted BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewing, accepted, signed
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE masivas_claims ENABLE ROW LEVEL SECURITY;

-- Admin can see all
CREATE POLICY masivas_claims_admin_all ON masivas_claims
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
  );

-- Users can see their own
CREATE POLICY masivas_claims_user_select ON masivas_claims
  FOR SELECT USING (user_id = auth.uid());

-- Anyone authenticated can insert
CREATE POLICY masivas_claims_insert ON masivas_claims
  FOR INSERT WITH CHECK (true);
