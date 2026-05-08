-- Sprint 9 — Generate Monthly Statements RPC (admin only)

CREATE OR REPLACE FUNCTION fn_generate_monthly_statements(p_period_start DATE)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_end DATE;
  v_count      INT := 0;
BEGIN
  -- Caller must be admin
  IF NOT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.user_id = (SELECT auth.uid())
      AND team_members.role = 'admin'
      AND team_members.is_active = true
  ) THEN
    RAISE EXCEPTION 'access_denied';
  END IF;

  v_period_end := (p_period_start + interval '1 month')::DATE;

  INSERT INTO statements (factory_id, period_start, period_end, gmv_cents, orders_count, fee_cents, net_cents, status)
  SELECT
    o.factory_id,
    p_period_start,
    v_period_end,
    SUM(o.total_cents)::BIGINT,
    COUNT(*)::INT,
    0::BIGINT,
    SUM(o.total_cents)::BIGINT,
    'draft'
  FROM orders o
  WHERE o.status = 'delivered'
    AND o.updated_at >= p_period_start::TIMESTAMPTZ
    AND o.updated_at < v_period_end::TIMESTAMPTZ
  GROUP BY o.factory_id
  ON CONFLICT (factory_id, period_start) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
