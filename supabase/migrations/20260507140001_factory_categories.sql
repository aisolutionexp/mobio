-- Sprint 3 — A2: Junction table factory_categories
-- Links factories to categories they operate in (e.g. "Calçados", "Bolsas").
-- Resolves pending decision from Sprint 1.

CREATE TABLE factory_categories (
  factory_id  UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  PRIMARY KEY (factory_id, category_id)
);

ALTER TABLE factory_categories ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see which categories a factory operates in
CREATE POLICY factory_categories_select_all ON factory_categories
  FOR SELECT USING (
    (SELECT auth.uid()) IS NOT NULL
  );

-- Factory owner can manage category associations
CREATE POLICY factory_categories_insert_owner ON factory_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = factory_categories.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE POLICY factory_categories_delete_owner ON factory_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = factory_categories.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_factory_categories_factory_id ON factory_categories (factory_id);
CREATE INDEX idx_factory_categories_category_id ON factory_categories (category_id);
