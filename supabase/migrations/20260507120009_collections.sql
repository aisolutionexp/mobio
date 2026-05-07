-- Migration 0010: Coleções da factory
-- Agrupamento de produtos por temporada/linha.

CREATE TABLE collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id  UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  season      TEXT,
  year        INT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_collection_slug_factory UNIQUE (factory_id, slug)
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Membros da factory veem suas coleções
CREATE POLICY collections_select_factory ON collections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = collections.factory_id
        AND team_members.is_active = true
    )
  );

-- Lojistas autenticados veem coleções ativas (catálogo público)
CREATE POLICY collections_select_public ON collections
  FOR SELECT USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id IS NOT NULL
        AND team_members.is_active = true
    )
  );

-- Owner/member da factory pode inserir coleção
CREATE POLICY collections_insert_factory ON collections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = collections.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Owner/member da factory pode atualizar coleção
CREATE POLICY collections_update_factory ON collections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = collections.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Apenas owner pode deletar coleção
CREATE POLICY collections_delete_factory ON collections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = collections.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_collections_factory_id ON collections (factory_id);
CREATE INDEX idx_collections_is_active ON collections (is_active);
CREATE INDEX idx_collections_slug ON collections (slug);
