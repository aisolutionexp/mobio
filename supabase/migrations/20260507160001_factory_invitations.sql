-- Sprint 4 — Factory Invitations (factory → retailer private invites)
-- Distinct from invites (S1) which are generic team member invites.

CREATE TABLE factory_invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id      UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  retailer_email  CITEXT NOT NULL,
  retailer_name   TEXT,
  token           TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  invited_by      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at     TIMESTAMPTZ,
  terms_snapshot  JSONB,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Only one pending invitation per email per factory
CREATE UNIQUE INDEX uq_factory_invitations_pending
  ON factory_invitations (factory_id, retailer_email)
  WHERE status = 'pending';

ALTER TABLE factory_invitations ENABLE ROW LEVEL SECURITY;

-- Factory owner/member can see their invitations
CREATE POLICY factory_invitations_select_factory ON factory_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = factory_invitations.factory_id
        AND team_members.is_active = true
    )
  );

-- Factory owner can create invitations
CREATE POLICY factory_invitations_insert_factory ON factory_invitations
  FOR INSERT WITH CHECK (
    invited_by = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = factory_invitations.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- Factory owner can update (revoke)
CREATE POLICY factory_invitations_update_factory ON factory_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = factory_invitations.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- No DELETE: invitations are tracked (soft revoke via status)

CREATE TRIGGER trg_factory_invitations_updated_at
  BEFORE UPDATE ON factory_invitations
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_factory_invitations_factory_id ON factory_invitations (factory_id);
CREATE INDEX idx_factory_invitations_status ON factory_invitations (status);
CREATE INDEX idx_factory_invitations_invited_by ON factory_invitations (invited_by);
CREATE INDEX idx_factory_invitations_retailer_email ON factory_invitations (retailer_email);
