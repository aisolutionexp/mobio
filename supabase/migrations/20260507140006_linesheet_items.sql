-- Sprint 3 — A7: Linesheet items (products in a linesheet)

CREATE TABLE linesheet_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linesheet_id UUID NOT NULL REFERENCES linesheets(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position     INT NOT NULL DEFAULT 0,
  custom_price NUMERIC(10, 2),
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_linesheet_product UNIQUE (linesheet_id, product_id)
);

ALTER TABLE linesheet_items ENABLE ROW LEVEL SECURITY;

-- Visibility inherited from parent linesheet via factory membership
CREATE POLICY linesheet_items_select_factory ON linesheet_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM linesheets
      JOIN team_members ON team_members.factory_id = linesheets.factory_id
      WHERE linesheets.id = linesheet_items.linesheet_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Retailers see items of active linesheets they have access to
CREATE POLICY linesheet_items_select_retailer ON linesheet_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM linesheets
      WHERE linesheets.id = linesheet_items.linesheet_id
        AND linesheets.status = 'active'
        AND (
          (linesheets.type = 'public' AND EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.user_id = (SELECT auth.uid())
              AND team_members.retailer_id IS NOT NULL
              AND team_members.is_active = true
          ))
          OR
          (linesheets.type = 'shared' AND EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.user_id = (SELECT auth.uid())
              AND team_members.retailer_id = linesheets.target_retailer_id
              AND team_members.is_active = true
          ))
        )
    )
  );

-- Factory owner/member can add items
CREATE POLICY linesheet_items_insert_factory ON linesheet_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM linesheets
      JOIN team_members ON team_members.factory_id = linesheets.factory_id
      WHERE linesheets.id = linesheet_items.linesheet_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Factory owner/member can update (position, custom_price)
CREATE POLICY linesheet_items_update_factory ON linesheet_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM linesheets
      JOIN team_members ON team_members.factory_id = linesheets.factory_id
      WHERE linesheets.id = linesheet_items.linesheet_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Factory owner can remove items
CREATE POLICY linesheet_items_delete_factory ON linesheet_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM linesheets
      JOIN team_members ON team_members.factory_id = linesheets.factory_id
      WHERE linesheets.id = linesheet_items.linesheet_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_linesheet_items_linesheet_id ON linesheet_items (linesheet_id);
CREATE INDEX idx_linesheet_items_product_id ON linesheet_items (product_id);
