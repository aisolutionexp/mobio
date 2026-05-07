-- Sprint 3 — A4: Boards (painéis de inspiração do lojista)

CREATE TABLE boards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  cover_url   TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT false,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Members of the retailer can see their boards
CREATE POLICY boards_select_member ON boards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = boards.retailer_id
        AND team_members.is_active = true
    )
  );

-- Public boards visible to any authenticated user
CREATE POLICY boards_select_public ON boards
  FOR SELECT USING (
    is_public = true AND (SELECT auth.uid()) IS NOT NULL
  );

-- Owner/buyer of the retailer can create boards
CREATE POLICY boards_insert_member ON boards
  FOR INSERT WITH CHECK (
    created_by = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = boards.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Creator or owner of the retailer can update
CREATE POLICY boards_update_member ON boards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = boards.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
    AND (created_by = (SELECT auth.uid()) OR EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = boards.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    ))
  );

-- Only creator or owner can delete
CREATE POLICY boards_delete_member ON boards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = boards.retailer_id
        AND team_members.is_active = true
    )
    AND (created_by = (SELECT auth.uid()) OR EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = boards.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    ))
  );

CREATE TRIGGER trg_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_boards_retailer_id ON boards (retailer_id);
CREATE INDEX idx_boards_created_by ON boards (created_by);
CREATE INDEX idx_boards_is_public ON boards (is_public);
