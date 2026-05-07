-- Sprint 3 — A12: Order items

CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents BIGINT NOT NULL CHECK (unit_price_cents >= 0),
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_order_product UNIQUE (order_id, product_id)
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Factory members see items of their orders
CREATE POLICY order_items_select_factory ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN team_members ON team_members.factory_id = orders.factory_id
      WHERE orders.id = order_items.order_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Retailer members see items of their orders
CREATE POLICY order_items_select_retailer ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN team_members ON team_members.retailer_id = orders.retailer_id
      WHERE orders.id = order_items.order_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Insert: via trigger (fn_copy_quote_items_to_order) or service_role
-- Manual insert by retailer when creating order without quote
CREATE POLICY order_items_insert_retailer ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN team_members ON team_members.retailer_id = orders.retailer_id
      WHERE orders.id = order_items.order_id
        AND orders.status = 'pending'
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- No UPDATE/DELETE on order items after creation (immutable snapshot)

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
