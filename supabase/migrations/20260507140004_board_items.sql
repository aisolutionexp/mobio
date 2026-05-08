-- Sprint 3 — A5: Board items (products pinned to a board)

CREATE TABLE board_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id   UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position   INT NOT NULL DEFAULT 0,
  added_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_board_product UNIQUE (board_id, product_id)
);

ALTER TABLE board_items ENABLE ROW LEVEL SECURITY;

-- Inherit visibility from parent board: members of the retailer
CREATE POLICY board_items_select_member ON board_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards
      JOIN team_members ON team_members.retailer_id = boards.retailer_id
      WHERE boards.id = board_items.board_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Public board items visible to authenticated users
CREATE POLICY board_items_select_public ON board_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_items.board_id
        AND boards.is_public = true
    )
    AND (SELECT auth.uid()) IS NOT NULL
  );

-- Members of the retailer can add items
CREATE POLICY board_items_insert_member ON board_items
  FOR INSERT WITH CHECK (
    added_by = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM boards
      JOIN team_members ON team_members.retailer_id = boards.retailer_id
      WHERE boards.id = board_items.board_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Members can update position
CREATE POLICY board_items_update_member ON board_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards
      JOIN team_members ON team_members.retailer_id = boards.retailer_id
      WHERE boards.id = board_items.board_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Creator of item or retailer owner can remove
CREATE POLICY board_items_delete_member ON board_items
  FOR DELETE USING (
    added_by = (SELECT auth.uid()) OR EXISTS (
      SELECT 1 FROM boards
      JOIN team_members ON team_members.retailer_id = boards.retailer_id
      WHERE boards.id = board_items.board_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_board_items_board_id ON board_items (board_id);
CREATE INDEX idx_board_items_product_id ON board_items (product_id);
CREATE INDEX idx_board_items_added_by ON board_items (added_by);
