-- Sprint 3 — A6: Linesheets (catálogos curados da factory para lojistas)

CREATE TABLE linesheets (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id         UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  type               TEXT NOT NULL DEFAULT 'public'
                       CHECK (type IN ('public', 'shared')),
  target_retailer_id UUID REFERENCES retailers(id) ON DELETE SET NULL,
  status             TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft', 'active', 'archived')),
  created_by         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at         TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- shared linesheets must have a target retailer
  CONSTRAINT chk_shared_requires_target CHECK (
    type = 'public' OR (type = 'shared' AND target_retailer_id IS NOT NULL)
  )
);

ALTER TABLE linesheets ENABLE ROW LEVEL SECURITY;

-- Factory members see all their linesheets
CREATE POLICY linesheets_select_factory ON linesheets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = linesheets.factory_id
        AND team_members.is_active = true
    )
  );

-- Retailers see active public linesheets + shared ones targeted at them
CREATE POLICY linesheets_select_retailer ON linesheets
  FOR SELECT USING (
    status = 'active' AND (
      (type = 'public' AND EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.user_id = (SELECT auth.uid())
          AND team_members.retailer_id IS NOT NULL
          AND team_members.is_active = true
      ))
      OR
      (type = 'shared' AND EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.user_id = (SELECT auth.uid())
          AND team_members.retailer_id = linesheets.target_retailer_id
          AND team_members.is_active = true
      ))
    )
  );

-- Factory owner/member can create linesheets
CREATE POLICY linesheets_insert_factory ON linesheets
  FOR INSERT WITH CHECK (
    created_by = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = linesheets.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Factory owner/member can update
CREATE POLICY linesheets_update_factory ON linesheets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = linesheets.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Only owner can delete
CREATE POLICY linesheets_delete_factory ON linesheets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = linesheets.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE TRIGGER trg_linesheets_updated_at
  BEFORE UPDATE ON linesheets
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_linesheets_factory_id ON linesheets (factory_id);
CREATE INDEX idx_linesheets_target_retailer_id ON linesheets (target_retailer_id);
CREATE INDEX idx_linesheets_status ON linesheets (status);
CREATE INDEX idx_linesheets_type ON linesheets (type);
CREATE INDEX idx_linesheets_created_by ON linesheets (created_by);
