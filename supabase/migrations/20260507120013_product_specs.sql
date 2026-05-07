-- Migration 0014: Especificações técnicas dos produtos
-- Atributos variáveis por produto (tamanho, material, peso, etc.)

CREATE TABLE product_specs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  spec_key   TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_product_spec_key UNIQUE (product_id, spec_key)
);

ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;

-- Membros da factory veem specs dos seus produtos
CREATE POLICY product_specs_select_factory ON product_specs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = product_specs.factory_id
        AND team_members.is_active = true
    )
  );

-- Lojistas veem specs de produtos ativos
CREATE POLICY product_specs_select_public ON product_specs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_specs.product_id
        AND products.is_active = true
    ) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id IS NOT NULL
        AND team_members.is_active = true
    )
  );

-- Owner/member pode inserir spec
CREATE POLICY product_specs_insert_factory ON product_specs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = product_specs.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Owner/member pode atualizar spec
CREATE POLICY product_specs_update_factory ON product_specs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = product_specs.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Owner pode deletar spec
CREATE POLICY product_specs_delete_factory ON product_specs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = product_specs.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_product_specs_product_id ON product_specs (product_id);
CREATE INDEX idx_product_specs_factory_id ON product_specs (factory_id);
