-- Sprint 3 — A3: Junction table retailer_segments
-- Links retailers to categories they are interested in (segments).
-- Uses categories as segment source for now — avoids premature abstraction.
-- Resolves pending decision from Sprint 1.

CREATE TABLE retailer_segments (
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  PRIMARY KEY (retailer_id, category_id)
);

ALTER TABLE retailer_segments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see retailer segments (discovery)
CREATE POLICY retailer_segments_select_all ON retailer_segments
  FOR SELECT USING (
    (SELECT auth.uid()) IS NOT NULL
  );

-- Retailer owner can manage segments
CREATE POLICY retailer_segments_insert_owner ON retailer_segments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = retailer_segments.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

CREATE POLICY retailer_segments_delete_owner ON retailer_segments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = retailer_segments.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_retailer_segments_retailer_id ON retailer_segments (retailer_id);
CREATE INDEX idx_retailer_segments_category_id ON retailer_segments (category_id);
