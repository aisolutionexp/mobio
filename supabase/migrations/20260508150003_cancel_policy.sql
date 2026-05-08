-- Sprint 7 — Cancel Policy + State Machine validation

ALTER TABLE factory_settings
  ADD COLUMN cancellation_policy_hours INTEGER NOT NULL DEFAULT 24
    CHECK (cancellation_policy_hours >= 0);

-- Function to check if an order can be cancelled
-- Returns TRUE if: status = 'pending' AND within cancellation window
CREATE OR REPLACE FUNCTION fn_can_cancel_order(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_created_at TIMESTAMPTZ;
  v_factory_id UUID;
  v_policy_hours INTEGER;
BEGIN
  SELECT status, created_at, factory_id
  INTO v_status, v_created_at, v_factory_id
  FROM orders
  WHERE id = p_order_id;

  IF v_status IS NULL THEN
    RETURN false;
  END IF;

  IF v_status != 'pending' THEN
    RETURN false;
  END IF;

  SELECT COALESCE(cancellation_policy_hours, 24)
  INTO v_policy_hours
  FROM factory_settings
  WHERE factory_id = v_factory_id;

  IF v_policy_hours IS NULL THEN
    v_policy_hours := 24;
  END IF;

  RETURN (v_created_at + (v_policy_hours || ' hours')::INTERVAL) > now();
END;
$$;
