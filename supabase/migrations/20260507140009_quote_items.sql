-- Sprint 3 — A10: Quote items (products in a quote with pricing)

CREATE TABLE quote_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents BIGINT NOT NULL CHECK (unit_price_cents >= 0),
  custom_specs    JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_quote_product UNIQUE (quote_id, product_id)
);

ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Visibility inherited from parent quote: factory members
CREATE POLICY quote_items_select_factory ON quote_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quotes
      JOIN team_members ON team_members.factory_id = quotes.factory_id
      WHERE quotes.id = quote_items.quote_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Retailer members see items of non-draft quotes
CREATE POLICY quote_items_select_retailer ON quote_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quotes
      JOIN team_members ON team_members.retailer_id = quotes.retailer_id
      WHERE quotes.id = quote_items.quote_id
        AND quotes.status != 'draft'
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Factory owner/member can manage items
CREATE POLICY quote_items_insert_factory ON quote_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      JOIN team_members ON team_members.factory_id = quotes.factory_id
      WHERE quotes.id = quote_items.quote_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

CREATE POLICY quote_items_update_factory ON quote_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM quotes
      JOIN team_members ON team_members.factory_id = quotes.factory_id
      WHERE quotes.id = quote_items.quote_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

CREATE POLICY quote_items_delete_factory ON quote_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM quotes
      JOIN team_members ON team_members.factory_id = quotes.factory_id
      WHERE quotes.id = quote_items.quote_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_quote_items_quote_id ON quote_items (quote_id);
CREATE INDEX idx_quote_items_product_id ON quote_items (product_id);
