-- Migration 0009: Endereços
-- Polimórfico: pode pertencer a factory OU retailer (um dos dois).

CREATE TABLE addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id  UUID REFERENCES factories(id) ON DELETE CASCADE,
  retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE,
  label       TEXT NOT NULL DEFAULT 'principal',
  street      TEXT NOT NULL,
  number      TEXT,
  complement  TEXT,
  district    TEXT NOT NULL,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  zip_code    TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'BR',
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT chk_address_owner CHECK (
    (factory_id IS NOT NULL AND retailer_id IS NULL)
    OR (factory_id IS NULL AND retailer_id IS NOT NULL)
  )
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Membros da factory veem endereços da sua factory
CREATE POLICY addresses_select_factory ON addresses
  FOR SELECT USING (
    factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = addresses.factory_id
        AND team_members.is_active = true
    )
  );

-- Membros do retailer veem endereços do seu retailer
CREATE POLICY addresses_select_retailer ON addresses
  FOR SELECT USING (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = addresses.retailer_id
        AND team_members.is_active = true
    )
  );

-- Owner da factory pode inserir endereço
CREATE POLICY addresses_insert_factory ON addresses
  FOR INSERT WITH CHECK (
    factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = addresses.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- Owner do retailer pode inserir endereço
CREATE POLICY addresses_insert_retailer ON addresses
  FOR INSERT WITH CHECK (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = addresses.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

-- Owner da factory pode atualizar endereço
CREATE POLICY addresses_update_factory ON addresses
  FOR UPDATE USING (
    factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = addresses.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- Owner do retailer pode atualizar endereço
CREATE POLICY addresses_update_retailer ON addresses
  FOR UPDATE USING (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = addresses.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

-- Owner pode deletar endereço da sua factory
CREATE POLICY addresses_delete_factory ON addresses
  FOR DELETE USING (
    factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = addresses.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- Owner pode deletar endereço do seu retailer
CREATE POLICY addresses_delete_retailer ON addresses
  FOR DELETE USING (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = addresses.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_addresses_factory_id ON addresses (factory_id);
CREATE INDEX idx_addresses_retailer_id ON addresses (retailer_id);
