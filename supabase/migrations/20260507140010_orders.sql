-- Sprint 3 — A11: Orders

CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id            UUID REFERENCES quotes(id) ON DELETE SET NULL,
  factory_id          UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  retailer_id         UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled')),
  total_cents         BIGINT NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'BRL'
                        CHECK (currency IN ('BRL', 'USD', 'EUR')),
  payment_status      TEXT NOT NULL DEFAULT 'pending'
                        CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  notes               TEXT,
  created_by          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Factory members see orders for their factory
CREATE POLICY orders_select_factory ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = orders.factory_id
        AND team_members.is_active = true
    )
  );

-- Retailer members see their orders
CREATE POLICY orders_select_retailer ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = orders.retailer_id
        AND team_members.is_active = true
    )
  );

-- Retailer owner/buyer can create orders
CREATE POLICY orders_insert_retailer ON orders
  FOR INSERT WITH CHECK (
    created_by = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = orders.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Factory can update order status/payment
CREATE POLICY orders_update_factory ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = orders.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Retailer can update (cancel while pending)
CREATE POLICY orders_update_retailer ON orders
  FOR UPDATE USING (
    status = 'pending' AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = orders.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- No DELETE: orders are never deleted, only cancelled

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- Trigger: copy items from quote when order is created with a quote_id
CREATE OR REPLACE FUNCTION fn_copy_quote_items_to_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.quote_id IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
    SELECT NEW.id, qi.product_id, qi.quantity, qi.unit_price_cents
    FROM quote_items qi
    WHERE qi.quote_id = NEW.quote_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_after_insert_copy_quote
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_copy_quote_items_to_order();

CREATE INDEX idx_orders_factory_id ON orders (factory_id);
CREATE INDEX idx_orders_retailer_id ON orders (retailer_id);
CREATE INDEX idx_orders_quote_id ON orders (quote_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);
CREATE INDEX idx_orders_created_by ON orders (created_by);
