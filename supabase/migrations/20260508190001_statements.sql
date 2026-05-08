-- Sprint 9 — Statements (fatura mensal por factory)

CREATE TABLE statements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id   UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  gmv_cents    BIGINT NOT NULL DEFAULT 0,
  orders_count INT NOT NULL DEFAULT 0,
  fee_cents    BIGINT NOT NULL DEFAULT 0,
  net_cents    BIGINT NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'issued', 'paid')),
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_statement_factory_period UNIQUE (factory_id, period_start)
);

ALTER TABLE statements ENABLE ROW LEVEL SECURITY;

-- Factory owner sees their statements
CREATE POLICY statements_select_factory ON statements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = statements.factory_id
        AND team_members.is_active = true
    )
  );

-- Admin sees all statements
CREATE POLICY statements_select_admin ON statements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.role = 'admin'
        AND team_members.is_active = true
    )
  );

-- Admin can insert (generate) and update (mark paid) statements
CREATE POLICY statements_insert_admin ON statements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.role = 'admin'
        AND team_members.is_active = true
    )
  );

CREATE POLICY statements_update_admin ON statements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.role = 'admin'
        AND team_members.is_active = true
    )
  );

-- No DELETE: statements are immutable financial records

CREATE TRIGGER trg_statements_updated_at
  BEFORE UPDATE ON statements
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_statements_factory_id ON statements (factory_id);
CREATE INDEX idx_statements_period ON statements (period_start, period_end);
CREATE INDEX idx_statements_status ON statements (status);
