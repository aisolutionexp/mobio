-- Migration 0016: Favoritos do retailer
-- Lojistas podem favoritar produtos e factories.

CREATE TABLE favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  factory_id  UUID REFERENCES factories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Favorita produto OU factory (nunca ambos)
  CONSTRAINT chk_favorite_target CHECK (
    (product_id IS NOT NULL AND factory_id IS NULL)
    OR (product_id IS NULL AND factory_id IS NOT NULL)
  ),

  -- Um favorito por combinação user+retailer+target
  CONSTRAINT uq_favorite_product UNIQUE (user_id, retailer_id, product_id),
  CONSTRAINT uq_favorite_factory UNIQUE (user_id, retailer_id, factory_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Usuário vê seus próprios favoritos dentro do retailer
CREATE POLICY favorites_select_own ON favorites
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = favorites.retailer_id
        AND team_members.is_active = true
    )
  );

-- Usuário pode inserir favorito para si no retailer que pertence
CREATE POLICY favorites_insert_own ON favorites
  FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = favorites.retailer_id
        AND team_members.is_active = true
    )
  );

-- Usuário pode remover seus favoritos
CREATE POLICY favorites_delete_own ON favorites
  FOR DELETE USING (
    user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = favorites.retailer_id
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_favorites_user_id ON favorites (user_id);
CREATE INDEX idx_favorites_retailer_id ON favorites (retailer_id);
CREATE INDEX idx_favorites_product_id ON favorites (product_id);
CREATE INDEX idx_favorites_factory_id ON favorites (factory_id);
