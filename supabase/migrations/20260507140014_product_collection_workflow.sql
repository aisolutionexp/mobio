-- Sprint 3 — B: Product & collection publish workflow
-- Adds status + published_at to products and collections.
-- Retailers only see published products/collections (via updated RLS).

-- Collections: add status and published_at
ALTER TABLE collections
  ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  ADD COLUMN published_at TIMESTAMPTZ;

-- Products: add status and published_at
ALTER TABLE products
  ADD COLUMN status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  ADD COLUMN published_at TIMESTAMPTZ;

-- Trigger: auto-set published_at when status changes to 'published'
CREATE OR REPLACE FUNCTION fn_set_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_collections_published_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION fn_set_published_at();

CREATE TRIGGER trg_products_published_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION fn_set_published_at();

-- Update RLS: retailers now see only published products/collections instead of is_active
DROP POLICY IF EXISTS collections_select_public ON collections;
CREATE POLICY collections_select_public ON collections
  FOR SELECT USING (
    status = 'published' AND is_active = true AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id IS NOT NULL
        AND team_members.is_active = true
    )
  );

DROP POLICY IF EXISTS products_select_public ON products;
CREATE POLICY products_select_public ON products
  FOR SELECT USING (
    status = 'published' AND is_active = true AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id IS NOT NULL
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_collections_status ON collections (status);
CREATE INDEX idx_products_status ON products (status);
