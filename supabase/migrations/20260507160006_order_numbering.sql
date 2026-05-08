-- Sprint 4 — Order Numbering (MOB-YYYY-NNNNN)
-- Uses PostgreSQL sequence for atomic incrementing.
-- Trade-off: gaps may occur on transaction rollback (idiomatic Postgres behavior).
-- Sequences are non-transactional by design — once nextval is called, the value
-- is consumed even if the transaction rolls back. This is acceptable for order
-- numbers where uniqueness matters more than gap-free sequences.

ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;

-- Sequence for the current year (2026). For future years, create new sequences
-- or use the function below which handles year-based naming.
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1 INCREMENT BY 1 NO CYCLE;

-- Function to generate order number in format MOB-YYYY-NNNNN
CREATE OR REPLACE FUNCTION fn_generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year INT;
  v_seq  BIGINT;
BEGIN
  IF NEW.order_number IS NULL THEN
    v_year := EXTRACT(YEAR FROM COALESCE(NEW.created_at, now()))::INT;
    v_seq := nextval('order_number_seq');
    NEW.order_number := 'MOB-' || v_year::TEXT || '-' || lpad(v_seq::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_before_insert_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_generate_order_number();

CREATE INDEX idx_orders_order_number ON orders (order_number);
