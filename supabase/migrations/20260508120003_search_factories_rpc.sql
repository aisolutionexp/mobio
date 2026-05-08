-- Sprint 5 — M4: RPC para busca pública de factories no discover
-- SECURITY INVOKER: respeita RLS (factories_select_active já filtra is_active = true).
-- Lojista autenticado busca factories por nome, região e/ou categoria.

CREATE OR REPLACE FUNCTION search_factories(
  query_text TEXT DEFAULT NULL,
  region_id_filter UUID DEFAULT NULL,
  category_id_filter UUID DEFAULT NULL,
  limit_count INT DEFAULT 20
)
RETURNS SETOF factories
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT DISTINCT f.*
    FROM factories f
    LEFT JOIN factory_categories fc ON fc.factory_id = f.id
    WHERE f.is_active = true
      AND (query_text IS NULL OR f.name ILIKE '%' || query_text || '%')
      AND (region_id_filter IS NULL OR f.region_id = region_id_filter)
      AND (category_id_filter IS NULL OR fc.category_id = category_id_filter)
    ORDER BY f.name ASC
    LIMIT LEAST(limit_count, 100);
END;
$$;
