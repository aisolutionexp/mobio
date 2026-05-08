-- Sprint 6 — RPC pública: retorna linesheet + items via share token
-- SECURITY DEFINER bypassa RLS — acesso público sem login

CREATE OR REPLACE FUNCTION get_linesheet_by_token(p_token TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_token_row RECORD;
  v_linesheet RECORD;
  v_items JSONB;
  v_result JSONB;
BEGIN
  SELECT lst.id AS token_id, lst.linesheet_id
  INTO v_token_row
  FROM linesheet_share_tokens lst
  WHERE lst.token = p_token
    AND lst.is_revoked = false
    AND (lst.expires_at IS NULL OR lst.expires_at > now());

  IF v_token_row IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE linesheet_share_tokens
  SET access_count = access_count + 1,
      last_accessed_at = now()
  WHERE id = v_token_row.token_id;

  SELECT l.id, l.name, l.pricing_variant, l.status,
         f.name AS factory_name, f.slug AS factory_slug,
         f.logo_url AS factory_logo_url
  INTO v_linesheet
  FROM linesheets l
  JOIN factories f ON f.id = l.factory_id
  WHERE l.id = v_token_row.linesheet_id
    AND l.status = 'active';

  IF v_linesheet IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', li.id,
      'position', li.position,
      'custom_price', li.custom_price,
      'note', li.note,
      'product', jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'slug', p.slug,
        'description', p.description,
        'reference', p.reference,
        'wholesale_price', p.wholesale_price,
        'retail_price', p.retail_price,
        'msrp', p.msrp,
        'min_order_qty', p.min_order_qty,
        'images', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', pi.id,
              'path', pi.path,
              'alt_text', pi.alt_text,
              'sort_order', pi.sort_order,
              'is_cover', pi.is_cover
            ) ORDER BY pi.sort_order
          ), '[]'::jsonb)
          FROM product_images pi
          WHERE pi.product_id = p.id
        )
      )
    ) ORDER BY li.position
  )
  INTO v_items
  FROM linesheet_items li
  JOIN products p ON p.id = li.product_id
  WHERE li.linesheet_id = v_token_row.linesheet_id;

  v_result := jsonb_build_object(
    'id', v_linesheet.id,
    'name', v_linesheet.name,
    'pricing_variant', v_linesheet.pricing_variant,
    'status', v_linesheet.status,
    'factory_name', v_linesheet.factory_name,
    'factory_slug', v_linesheet.factory_slug,
    'factory_logo_url', v_linesheet.factory_logo_url,
    'items', COALESCE(v_items, '[]'::jsonb)
  );

  RETURN v_result;
END;
$$;
