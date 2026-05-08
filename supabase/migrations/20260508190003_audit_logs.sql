-- Sprint 9 — Audit Logs table

CREATE TABLE audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name     TEXT NOT NULL,
  operation      TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id      UUID NOT NULL,
  actor_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  before_data    JSONB,
  after_data     JSONB,
  created_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin can read audit logs
CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.role = 'admin'
        AND team_members.is_active = true
    )
  );

-- Immutable: no INSERT/UPDATE/DELETE policies for clients
-- Writes happen via SECURITY DEFINER trigger function

CREATE INDEX idx_audit_logs_table_created ON audit_logs (table_name, created_at DESC);
CREATE INDEX idx_audit_logs_actor_created ON audit_logs (actor_user_id, created_at DESC);
CREATE INDEX idx_audit_logs_record_id ON audit_logs (record_id);
