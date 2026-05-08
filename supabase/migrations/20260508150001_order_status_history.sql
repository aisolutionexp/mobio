-- Sprint 7 — Order Status History (timeline of status transitions)

CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status   TEXT NOT NULL,
  changed_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Factory members can see history of their orders
CREATE POLICY order_status_history_select_factory ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN team_members ON team_members.factory_id = orders.factory_id
      WHERE orders.id = order_status_history.order_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Retailer members can see history of their orders
CREATE POLICY order_status_history_select_retailer ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN team_members ON team_members.retailer_id = orders.retailer_id
      WHERE orders.id = order_status_history.order_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- No direct INSERT/UPDATE/DELETE by clients — managed by trigger (SECURITY DEFINER)

-- Trigger: automatically log status changes on orders
CREATE OR REPLACE FUNCTION fn_log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, (SELECT auth.uid()));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_before_update_log_status
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_log_order_status_change();

CREATE INDEX idx_order_status_history_order_created ON order_status_history (order_id, created_at DESC);
CREATE INDEX idx_order_status_history_changed_by ON order_status_history (changed_by);
