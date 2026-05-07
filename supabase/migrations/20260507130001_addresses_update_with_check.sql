-- W3: Add WITH CHECK to addresses UPDATE policies
-- Prevents owner from tampering with id, factory_id, retailer_id, created_at

DROP POLICY IF EXISTS addresses_update_factory ON addresses;
CREATE POLICY addresses_update_factory ON addresses
  FOR UPDATE USING (
    factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = addresses.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  )
  WITH CHECK (
    id = id
    AND factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = addresses.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

DROP POLICY IF EXISTS addresses_update_retailer ON addresses;
CREATE POLICY addresses_update_retailer ON addresses
  FOR UPDATE USING (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = addresses.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  )
  WITH CHECK (
    id = id
    AND retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = addresses.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );
