-- Migration 0006: Retailers (lojistas multimarca)
-- Tenant principal do shell Lojista. Isolamento via retailer_id em RLS.

CREATE TABLE retailers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_path   TEXT,
  website     TEXT,
  phone       TEXT,
  email       CITEXT,
  region_id   UUID REFERENCES regions(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado vê retailers ativos
CREATE POLICY retailers_select_active ON retailers
  FOR SELECT USING (is_active = true);

-- Apenas o criador pode inserir (signup flow)
CREATE POLICY retailers_insert_own ON retailers
  FOR INSERT WITH CHECK (created_by = (SELECT auth.uid()));

-- Update: apenas membros com role owner (verificado via team_members na migration 0008)

CREATE INDEX idx_retailers_slug ON retailers (slug);
CREATE INDEX idx_retailers_region_id ON retailers (region_id);
CREATE INDEX idx_retailers_created_by ON retailers (created_by);
CREATE INDEX idx_retailers_is_active ON retailers (is_active);
