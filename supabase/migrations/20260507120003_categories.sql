-- Migration 0004: Categorias de produtos
-- Lookup table hierárquica com leitura pública.

CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  parent_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Leitura pública (lookup table)
CREATE POLICY categories_select_all ON categories
  FOR SELECT USING (true);

CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_parent_id ON categories (parent_id);
