-- Migration 0003: Regiões (estados/países)
-- Lookup table com leitura pública. Usada por factories e retailers para endereço.

CREATE TABLE regions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT NOT NULL UNIQUE,
  country    TEXT NOT NULL DEFAULT 'BR',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- Leitura pública (lookup table)
CREATE POLICY regions_select_all ON regions
  FOR SELECT USING (true);

-- Apenas admin insere/atualiza (via service_role no seed)
-- Sem policy de INSERT/UPDATE/DELETE para usuários normais

CREATE INDEX idx_regions_code ON regions (code);
CREATE INDEX idx_regions_country ON regions (country);
