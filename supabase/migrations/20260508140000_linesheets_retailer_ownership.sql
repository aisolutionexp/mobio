-- Allow retailers to own linesheets (curated selections)
-- factory_id stays for factory-owned linesheets; retailer_id added for retailer-owned

ALTER TABLE linesheets ALTER COLUMN factory_id DROP NOT NULL;

ALTER TABLE linesheets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE linesheets ADD COLUMN IF NOT EXISTS retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE;

DO $$ BEGIN
  ALTER TABLE linesheets ADD CONSTRAINT chk_linesheet_owner
    CHECK (factory_id IS NOT NULL OR retailer_id IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_linesheets_retailer_id ON linesheets (retailer_id);

-- Retailer members can see their own linesheets
DROP POLICY IF EXISTS linesheets_select_retailer_own ON linesheets;
CREATE POLICY linesheets_select_retailer_own ON linesheets
  FOR SELECT USING (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = linesheets.retailer_id
        AND team_members.is_active = true
    )
  );

-- Retailer owner/buyer can create linesheets
DROP POLICY IF EXISTS linesheets_insert_retailer ON linesheets;
CREATE POLICY linesheets_insert_retailer ON linesheets
  FOR INSERT WITH CHECK (
    retailer_id IS NOT NULL
    AND created_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = linesheets.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Retailer owner/buyer can update their linesheets
DROP POLICY IF EXISTS linesheets_update_retailer ON linesheets;
CREATE POLICY linesheets_update_retailer ON linesheets
  FOR UPDATE USING (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = linesheets.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Retailer owner can delete their linesheets
DROP POLICY IF EXISTS linesheets_delete_retailer ON linesheets;
CREATE POLICY linesheets_delete_retailer ON linesheets
  FOR DELETE USING (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = linesheets.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

-- Retailer linesheet_items: SELECT for items in retailer-owned linesheets
DROP POLICY IF EXISTS linesheet_items_select_retailer ON linesheet_items;
CREATE POLICY linesheet_items_select_retailer ON linesheet_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM linesheets
      WHERE linesheets.id = linesheet_items.linesheet_id
        AND linesheets.retailer_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.user_id = (SELECT auth.uid())
            AND team_members.retailer_id = linesheets.retailer_id
            AND team_members.is_active = true
        )
    )
  );

-- Retailer can insert items into their linesheets
DROP POLICY IF EXISTS linesheet_items_insert_retailer ON linesheet_items;
CREATE POLICY linesheet_items_insert_retailer ON linesheet_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM linesheets
      WHERE linesheets.id = linesheet_items.linesheet_id
        AND linesheets.retailer_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.user_id = (SELECT auth.uid())
            AND team_members.retailer_id = linesheets.retailer_id
            AND team_members.role IN ('lojista_owner', 'lojista_buyer')
            AND team_members.is_active = true
        )
    )
  );

-- Retailer can update items in their linesheets
DROP POLICY IF EXISTS linesheet_items_update_retailer ON linesheet_items;
CREATE POLICY linesheet_items_update_retailer ON linesheet_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM linesheets
      WHERE linesheets.id = linesheet_items.linesheet_id
        AND linesheets.retailer_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.user_id = (SELECT auth.uid())
            AND team_members.retailer_id = linesheets.retailer_id
            AND team_members.role IN ('lojista_owner', 'lojista_buyer')
            AND team_members.is_active = true
        )
    )
  );

-- Retailer can delete items from their linesheets
DROP POLICY IF EXISTS linesheet_items_delete_retailer ON linesheet_items;
CREATE POLICY linesheet_items_delete_retailer ON linesheet_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM linesheets
      WHERE linesheets.id = linesheet_items.linesheet_id
        AND linesheets.retailer_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.user_id = (SELECT auth.uid())
            AND team_members.retailer_id = linesheets.retailer_id
            AND team_members.role IN ('lojista_owner', 'lojista_buyer')
            AND team_members.is_active = true
        )
    )
  );
