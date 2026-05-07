-- Migration 0015: Convites de team members
-- Owner convida novos membros para factory/retailer via e-mail.

CREATE TABLE invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id  UUID REFERENCES factories(id) ON DELETE CASCADE,
  retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE,
  email       CITEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN (
    'atelier_member', 'lojista_buyer'
  )),
  token       TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  invited_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT chk_invite_tenant CHECK (
    (factory_id IS NOT NULL AND retailer_id IS NULL AND role = 'atelier_member')
    OR (factory_id IS NULL AND retailer_id IS NOT NULL AND role = 'lojista_buyer')
  )
);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Owner da factory vê convites da sua factory
CREATE POLICY invites_select_factory ON invites
  FOR SELECT USING (
    factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = invites.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- Owner do retailer vê convites do seu retailer
CREATE POLICY invites_select_retailer ON invites
  FOR SELECT USING (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = invites.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

-- Owner da factory pode criar convite
CREATE POLICY invites_insert_factory ON invites
  FOR INSERT WITH CHECK (
    factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = invites.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- Owner do retailer pode criar convite
CREATE POLICY invites_insert_retailer ON invites
  FOR INSERT WITH CHECK (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = invites.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

-- Owner pode revogar convite (update status para 'revoked')
CREATE POLICY invites_update_factory ON invites
  FOR UPDATE USING (
    factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = invites.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE POLICY invites_update_retailer ON invites
  FOR UPDATE USING (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = invites.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

-- Sem DELETE — convites são rastreados (soft revoke via status)

CREATE INDEX idx_invites_factory_id ON invites (factory_id);
CREATE INDEX idx_invites_retailer_id ON invites (retailer_id);
CREATE INDEX idx_invites_email ON invites (email);
CREATE INDEX idx_invites_token ON invites (token);
CREATE INDEX idx_invites_status ON invites (status);
CREATE INDEX idx_invites_invited_by ON invites (invited_by);
