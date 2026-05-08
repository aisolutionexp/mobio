-- Sprint 4 — Authorized Retailers (N:N factory ↔ retailer authorization)

CREATE TABLE authorized_retailers (
  factory_id    UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  retailer_id   UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  authorized_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'revoked')),
  authorized_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  PRIMARY KEY (factory_id, retailer_id)
);

ALTER TABLE authorized_retailers ENABLE ROW LEVEL SECURITY;

-- Factory owner/member can see their authorized retailers
CREATE POLICY authorized_retailers_select_factory ON authorized_retailers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = authorized_retailers.factory_id
        AND team_members.is_active = true
    )
  );

-- Retailer owner/member can see authorizations where they are the retailer
CREATE POLICY authorized_retailers_select_retailer ON authorized_retailers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = authorized_retailers.retailer_id
        AND team_members.is_active = true
    )
  );

-- Factory owner can authorize a retailer
CREATE POLICY authorized_retailers_insert_factory ON authorized_retailers
  FOR INSERT WITH CHECK (
    authorized_by = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = authorized_retailers.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- Factory owner can revoke (update status)
CREATE POLICY authorized_retailers_update_factory ON authorized_retailers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = authorized_retailers.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- No DELETE: revoke via status update

CREATE TRIGGER trg_authorized_retailers_updated_at
  BEFORE UPDATE ON authorized_retailers
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_authorized_retailers_factory_id ON authorized_retailers (factory_id);
CREATE INDEX idx_authorized_retailers_retailer_id ON authorized_retailers (retailer_id);
CREATE INDEX idx_authorized_retailers_status ON authorized_retailers (status);
CREATE INDEX idx_authorized_retailers_authorized_by ON authorized_retailers (authorized_by);
