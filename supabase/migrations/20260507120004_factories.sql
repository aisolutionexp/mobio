-- Migration 0005: Factories (ateliês/fábricas)
-- Tenant principal do shell Atelier. Isolamento via factory_id em RLS.

CREATE TABLE factories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_path   TEXT,
  cover_path  TEXT,
  website     TEXT,
  phone       TEXT,
  email       CITEXT,
  region_id   UUID REFERENCES regions(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE factories ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ver fábricas ativas (catálogo público para lojistas)
CREATE POLICY factories_select_active ON factories
  FOR SELECT USING (is_active = true);

-- Apenas o criador pode inserir (signup flow)
CREATE POLICY factories_insert_own ON factories
  FOR INSERT WITH CHECK (created_by = (SELECT auth.uid()));

-- Update: apenas membros com role owner (verificado via team_members na migration 0008)
-- Policy adicionada após team_members existir

CREATE INDEX idx_factories_slug ON factories (slug);
CREATE INDEX idx_factories_region_id ON factories (region_id);
CREATE INDEX idx_factories_created_by ON factories (created_by);
CREATE INDEX idx_factories_is_active ON factories (is_active);
