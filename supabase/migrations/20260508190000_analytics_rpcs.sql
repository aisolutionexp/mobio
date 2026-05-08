-- Sprint 9 — Analytics RPCs (factory, retailer, admin overview)

--------------------------------------------------------------------------------
-- 1. get_factory_analytics
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_factory_analytics(
  p_factory_id UUID,
  p_start      TIMESTAMPTZ,
  p_end        TIMESTAMPTZ
)
RETURNS TABLE (
  gmv_cents        BIGINT,
  orders_count     INT,
  avg_ticket_cents BIGINT,
  active_retailers INT,
  top_products     JSON,
  top_retailers    JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Caller must be a member of the factory
  IF NOT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.user_id = (SELECT auth.uid())
      AND team_members.factory_id = p_factory_id
      AND team_members.is_active = true
  ) THEN
    RAISE EXCEPTION 'access_denied';
  END IF;

  RETURN QUERY
  WITH filtered_orders AS (
    SELECT o.id, o.total_cents, o.retailer_id
    FROM orders o
    WHERE o.factory_id = p_factory_id
      AND o.status IN ('confirmed', 'in_production', 'shipped', 'delivered')
      AND o.created_at >= p_start
      AND o.created_at < p_end
  ),
  agg AS (
    SELECT
      COALESCE(SUM(fo.total_cents), 0)::BIGINT                          AS _gmv,
      COUNT(*)::INT                                                       AS _count,
      CASE WHEN COUNT(*) > 0
        THEN (SUM(fo.total_cents) / COUNT(*))::BIGINT ELSE 0 END         AS _avg,
      COUNT(DISTINCT fo.retailer_id)::INT                                 AS _retailers
    FROM filtered_orders fo
  ),
  tp AS (
    SELECT json_agg(row_to_json(t)) AS data FROM (
      SELECT p.id, p.name, SUM(oi.quantity)::INT AS total_qty,
             SUM(oi.unit_price_cents * oi.quantity)::BIGINT AS total_cents
      FROM filtered_orders fo
      JOIN order_items oi ON oi.order_id = fo.id
      JOIN products p ON p.id = oi.product_id
      GROUP BY p.id, p.name
      ORDER BY total_cents DESC
      LIMIT 10
    ) t
  ),
  tr AS (
    SELECT json_agg(row_to_json(t)) AS data FROM (
      SELECT r.id, r.name, COUNT(fo.id)::INT AS orders_count,
             SUM(fo.total_cents)::BIGINT AS total_cents
      FROM filtered_orders fo
      JOIN retailers r ON r.id = fo.retailer_id
      GROUP BY r.id, r.name
      ORDER BY total_cents DESC
      LIMIT 10
    ) t
  )
  SELECT agg._gmv, agg._count, agg._avg, agg._retailers,
         COALESCE(tp.data, '[]'::JSON),
         COALESCE(tr.data, '[]'::JSON)
  FROM agg, tp, tr;
END;
$$;

--------------------------------------------------------------------------------
-- 2. get_retailer_analytics
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_retailer_analytics(
  p_retailer_id UUID,
  p_start       TIMESTAMPTZ,
  p_end         TIMESTAMPTZ
)
RETURNS TABLE (
  total_spent_cents BIGINT,
  orders_count      INT,
  avg_ticket_cents  BIGINT,
  top_factories     JSON,
  top_categories    JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Caller must be a member of the retailer
  IF NOT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.user_id = (SELECT auth.uid())
      AND team_members.retailer_id = p_retailer_id
      AND team_members.is_active = true
  ) THEN
    RAISE EXCEPTION 'access_denied';
  END IF;

  RETURN QUERY
  WITH filtered_orders AS (
    SELECT o.id, o.total_cents, o.factory_id
    FROM orders o
    WHERE o.retailer_id = p_retailer_id
      AND o.status IN ('confirmed', 'in_production', 'shipped', 'delivered')
      AND o.created_at >= p_start
      AND o.created_at < p_end
  ),
  agg AS (
    SELECT
      COALESCE(SUM(fo.total_cents), 0)::BIGINT                          AS _spent,
      COUNT(*)::INT                                                       AS _count,
      CASE WHEN COUNT(*) > 0
        THEN (SUM(fo.total_cents) / COUNT(*))::BIGINT ELSE 0 END         AS _avg
    FROM filtered_orders fo
  ),
  tf AS (
    SELECT json_agg(row_to_json(t)) AS data FROM (
      SELECT f.id, f.name, COUNT(fo.id)::INT AS orders_count,
             SUM(fo.total_cents)::BIGINT AS total_cents
      FROM filtered_orders fo
      JOIN factories f ON f.id = fo.factory_id
      GROUP BY f.id, f.name
      ORDER BY total_cents DESC
      LIMIT 10
    ) t
  ),
  tc AS (
    SELECT json_agg(row_to_json(t)) AS data FROM (
      SELECT c.id, c.name, SUM(oi.quantity)::INT AS total_qty,
             SUM(oi.unit_price_cents * oi.quantity)::BIGINT AS total_cents
      FROM filtered_orders fo
      JOIN order_items oi ON oi.order_id = fo.id
      JOIN products p ON p.id = oi.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE p.category_id IS NOT NULL
      GROUP BY c.id, c.name
      ORDER BY total_cents DESC
      LIMIT 10
    ) t
  )
  SELECT agg._spent, agg._count, agg._avg,
         COALESCE(tf.data, '[]'::JSON),
         COALESCE(tc.data, '[]'::JSON)
  FROM agg, tf, tc;
END;
$$;

--------------------------------------------------------------------------------
-- 3. get_admin_overview
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_admin_overview()
RETURNS TABLE (
  total_factories   INT,
  total_retailers   INT,
  total_orders      INT,
  total_gmv_cents   BIGINT,
  signups_last_30d  INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INT FROM factories WHERE is_active = true),
    (SELECT COUNT(*)::INT FROM retailers WHERE is_active = true),
    (SELECT COUNT(*)::INT FROM orders
     WHERE status IN ('confirmed', 'in_production', 'shipped', 'delivered')),
    (SELECT COALESCE(SUM(total_cents), 0)::BIGINT FROM orders
     WHERE status IN ('confirmed', 'in_production', 'shipped', 'delivered')),
    (SELECT COUNT(*)::INT FROM profiles
     WHERE created_at >= now() - interval '30 days');
END;
$$;

-- Index for analytics date range queries
CREATE INDEX IF NOT EXISTS idx_orders_factory_created ON orders (factory_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_retailer_created ON orders (retailer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at);
