-- Sprint 6 — Linesheet share tokens (link público de compartilhamento)

CREATE TABLE linesheet_share_tokens (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linesheet_id     UUID NOT NULL REFERENCES linesheets(id) ON DELETE CASCADE,
  token            TEXT NOT NULL UNIQUE,
  expires_at       TIMESTAMPTZ,
  is_revoked       BOOLEAN NOT NULL DEFAULT false,
  created_by       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_accessed_at TIMESTAMPTZ,
  access_count     INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE linesheet_share_tokens ENABLE ROW LEVEL SECURITY;

-- Factory members who own the linesheet can manage tokens
CREATE POLICY linesheet_share_tokens_select_factory ON linesheet_share_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM linesheets
      JOIN team_members ON team_members.factory_id = linesheets.factory_id
      WHERE linesheets.id = linesheet_share_tokens.linesheet_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

CREATE POLICY linesheet_share_tokens_insert_factory ON linesheet_share_tokens
  FOR INSERT WITH CHECK (
    created_by = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM linesheets
      JOIN team_members ON team_members.factory_id = linesheets.factory_id
      WHERE linesheets.id = linesheet_share_tokens.linesheet_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

CREATE POLICY linesheet_share_tokens_update_factory ON linesheet_share_tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM linesheets
      JOIN team_members ON team_members.factory_id = linesheets.factory_id
      WHERE linesheets.id = linesheet_share_tokens.linesheet_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

CREATE POLICY linesheet_share_tokens_delete_factory ON linesheet_share_tokens
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM linesheets
      JOIN team_members ON team_members.factory_id = linesheets.factory_id
      WHERE linesheets.id = linesheet_share_tokens.linesheet_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE TRIGGER trg_linesheet_share_tokens_updated_at
  BEFORE UPDATE ON linesheet_share_tokens
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_linesheet_share_tokens_linesheet_id ON linesheet_share_tokens (linesheet_id);
CREATE INDEX idx_linesheet_share_tokens_is_revoked ON linesheet_share_tokens (is_revoked);
CREATE INDEX idx_linesheet_share_tokens_created_by ON linesheet_share_tokens (created_by);
