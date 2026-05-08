-- Sprint 4 — Retailer Addresses (shipping addresses for retailers)
-- Separate from addresses (S1) which are tenant HQ addresses.

CREATE TABLE retailer_addresses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id     UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  label           TEXT NOT NULL DEFAULT 'Principal',
  recipient_name  TEXT NOT NULL,
  address_line    TEXT NOT NULL,
  complement      TEXT,
  neighborhood    TEXT NOT NULL,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  zip_code        TEXT NOT NULL,
  region_id       UUID REFERENCES regions(id) ON DELETE SET NULL,
  is_default      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE retailer_addresses ENABLE ROW LEVEL SECURITY;

-- Retailer owner/buyer can see their addresses
CREATE POLICY retailer_addresses_select_own ON retailer_addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = retailer_addresses.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Factory can see retailer addresses for authorized retailers (needed for shipping)
CREATE POLICY retailer_addresses_select_factory ON retailer_addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM authorized_retailers ar
      JOIN team_members tm ON tm.factory_id = ar.factory_id
      WHERE ar.retailer_id = retailer_addresses.retailer_id
        AND ar.status = 'active'
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

-- Retailer owner/buyer can create addresses
CREATE POLICY retailer_addresses_insert_own ON retailer_addresses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = retailer_addresses.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Retailer owner/buyer can update addresses
CREATE POLICY retailer_addresses_update_own ON retailer_addresses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = retailer_addresses.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Retailer owner can delete addresses
CREATE POLICY retailer_addresses_delete_own ON retailer_addresses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = retailer_addresses.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

CREATE TRIGGER trg_retailer_addresses_updated_at
  BEFORE UPDATE ON retailer_addresses
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_retailer_addresses_retailer_id ON retailer_addresses (retailer_id);
CREATE INDEX idx_retailer_addresses_region_id ON retailer_addresses (region_id);
CREATE INDEX idx_retailer_addresses_is_default ON retailer_addresses (is_default);
