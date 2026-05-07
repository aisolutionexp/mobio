-- Migration 0011: Produtos da factory

CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id    UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  description   TEXT,
  reference     TEXT,
  min_order_qty INT NOT NULL DEFAULT 1,
  wholesale_price NUMERIC(10, 2),
  retail_price    NUMERIC(10, 2),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_product_slug_factory UNIQUE (factory_id, slug)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Membros da factory veem seus produtos
CREATE POLICY products_select_factory ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = products.factory_id
        AND team_members.is_active = true
    )
  );

-- Lojistas autenticados veem produtos ativos (catálogo público)
CREATE POLICY products_select_public ON products
  FOR SELECT USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id IS NOT NULL
        AND team_members.is_active = true
    )
  );

-- Owner/member da factory pode inserir produto
CREATE POLICY products_insert_factory ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = products.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Owner/member da factory pode atualizar produto
CREATE POLICY products_update_factory ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = products.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Apenas owner pode deletar produto
CREATE POLICY products_delete_factory ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = products.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_products_factory_id ON products (factory_id);
CREATE INDEX idx_products_collection_id ON products (collection_id);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_is_active ON products (is_active);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
