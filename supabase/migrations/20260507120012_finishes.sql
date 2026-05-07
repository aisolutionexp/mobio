-- Migration 0013: Acabamentos disponíveis na factory
-- Ex: couro, camurça, verniz, tecido, etc.

CREATE TABLE finishes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id  UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_finish_name_factory UNIQUE (factory_id, name)
);

ALTER TABLE finishes ENABLE ROW LEVEL SECURITY;

-- Membros da factory veem seus acabamentos
CREATE POLICY finishes_select_factory ON finishes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = finishes.factory_id
        AND team_members.is_active = true
    )
  );

-- Lojistas veem acabamentos ativos
CREATE POLICY finishes_select_public ON finishes
  FOR SELECT USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id IS NOT NULL
        AND team_members.is_active = true
    )
  );

-- Owner/member pode inserir acabamento
CREATE POLICY finishes_insert_factory ON finishes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = finishes.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Owner/member pode atualizar acabamento
CREATE POLICY finishes_update_factory ON finishes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = finishes.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_finishes_factory_id ON finishes (factory_id);
CREATE INDEX idx_finishes_is_active ON finishes (is_active);
