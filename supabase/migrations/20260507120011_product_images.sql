-- Migration 0012: Imagens dos produtos
-- RLS herdada do product via factory_id.

CREATE TABLE product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  path       TEXT NOT NULL,
  alt_text   TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_cover   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Membros da factory veem imagens dos seus produtos
CREATE POLICY product_images_select_factory ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = product_images.factory_id
        AND team_members.is_active = true
    )
  );

-- Lojistas veem imagens de produtos ativos
CREATE POLICY product_images_select_public ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
        AND products.is_active = true
    ) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id IS NOT NULL
        AND team_members.is_active = true
    )
  );

-- Owner/member da factory pode inserir imagem
CREATE POLICY product_images_insert_factory ON product_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = product_images.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Owner/member pode atualizar imagem
CREATE POLICY product_images_update_factory ON product_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = product_images.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Owner pode deletar imagem
CREATE POLICY product_images_delete_factory ON product_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = product_images.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_product_images_product_id ON product_images (product_id);
CREATE INDEX idx_product_images_factory_id ON product_images (factory_id);
