-- Sprint 7 — RPC accept_quote (atomic quote→order state machine)
-- Validates quote status, checks retailer membership, creates order atomically.

CREATE OR REPLACE FUNCTION accept_quote(p_quote_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote       RECORD;
  v_caller_id   UUID;
  v_is_retailer BOOLEAN;
  v_order_id    UUID;
BEGIN
  v_caller_id := (SELECT auth.uid());

  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id, factory_id, retailer_id, status, total_cents, currency, notes
  INTO v_quote
  FROM quotes
  WHERE id = p_quote_id
  FOR UPDATE;

  IF v_quote IS NULL THEN
    RAISE EXCEPTION 'Quote not found';
  END IF;

  IF v_quote.status != 'sent' THEN
    RAISE EXCEPTION 'Quote must be in "sent" status to accept. Current: %', v_quote.status;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.user_id = v_caller_id
      AND team_members.retailer_id = v_quote.retailer_id
      AND team_members.role IN ('lojista_owner', 'lojista_buyer')
      AND team_members.is_active = true
  ) INTO v_is_retailer;

  IF NOT v_is_retailer THEN
    RAISE EXCEPTION 'Only retailer members can accept quotes';
  END IF;

  UPDATE quotes SET status = 'accepted', updated_at = now()
  WHERE id = p_quote_id;

  INSERT INTO orders (quote_id, factory_id, retailer_id, status, total_cents, currency, notes, created_by)
  VALUES (v_quote.id, v_quote.factory_id, v_quote.retailer_id, 'pending', v_quote.total_cents, v_quote.currency, v_quote.notes, v_caller_id)
  RETURNING id INTO v_order_id;

  -- order_items are copied automatically by trg_orders_after_insert_copy_quote
  -- order_number is generated automatically by trg_orders_before_insert_order_number

  RETURN v_order_id;
END;
$$;
