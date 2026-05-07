-- Sprint 3 — A9: Quotes (orçamentos da factory para retailer)

CREATE TABLE quotes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id  UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  total_cents BIGINT NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'BRL'
                CHECK (currency IN ('BRL', 'USD', 'EUR')),
  valid_until TIMESTAMPTZ,
  notes       TEXT,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Factory members see quotes of their factory
CREATE POLICY quotes_select_factory ON quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = quotes.factory_id
        AND team_members.is_active = true
    )
  );

-- Retailer members see quotes sent to them (not drafts)
CREATE POLICY quotes_select_retailer ON quotes
  FOR SELECT USING (
    status != 'draft' AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = quotes.retailer_id
        AND team_members.is_active = true
    )
  );

-- Factory owner/member can create quotes
CREATE POLICY quotes_insert_factory ON quotes
  FOR INSERT WITH CHECK (
    created_by = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = quotes.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Factory can update (edit draft, change status to sent)
CREATE POLICY quotes_update_factory ON quotes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = quotes.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Retailer can update status (accept/reject)
CREATE POLICY quotes_update_retailer ON quotes
  FOR UPDATE USING (
    status = 'sent' AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = quotes.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Only factory owner can delete (draft only)
CREATE POLICY quotes_delete_factory ON quotes
  FOR DELETE USING (
    status = 'draft' AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = quotes.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE TRIGGER trg_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_quotes_factory_id ON quotes (factory_id);
CREATE INDEX idx_quotes_retailer_id ON quotes (retailer_id);
CREATE INDEX idx_quotes_status ON quotes (status);
CREATE INDEX idx_quotes_created_by ON quotes (created_by);
