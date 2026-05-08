-- Sprint 4 — Factory Settings (commercial configuration 1:1 with factories)

CREATE TABLE factory_settings (
  factory_id       UUID PRIMARY KEY REFERENCES factories(id) ON DELETE CASCADE,
  payment_terms    JSONB NOT NULL DEFAULT '{}',
  shipping_policy  JSONB NOT NULL DEFAULT '{}',
  commercial_terms JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE factory_settings ENABLE ROW LEVEL SECURITY;

-- Factory owner/member can see their settings
CREATE POLICY factory_settings_select_factory ON factory_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = factory_settings.factory_id
        AND team_members.is_active = true
    )
  );

-- Authorized retailers can see factory settings (needed for ordering)
CREATE POLICY factory_settings_select_authorized ON factory_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM authorized_retailers ar
      JOIN team_members tm ON tm.retailer_id = ar.retailer_id
      WHERE ar.factory_id = factory_settings.factory_id
        AND ar.status = 'active'
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

-- Factory owner can insert settings
CREATE POLICY factory_settings_insert_factory ON factory_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = factory_settings.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- Factory owner can update settings
CREATE POLICY factory_settings_update_factory ON factory_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = factory_settings.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- No DELETE: settings are 1:1, cascaded from factory

CREATE TRIGGER trg_factory_settings_updated_at
  BEFORE UPDATE ON factory_settings
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
