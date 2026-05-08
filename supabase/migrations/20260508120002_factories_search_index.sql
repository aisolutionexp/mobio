-- Sprint 5 — M3: Índices GIN pg_trgm para busca textual no discover
-- pg_trgm já habilitado na migration 0001 (extensions).
-- products.name já tem idx_products_name_trgm (migration 0011) — não recriar.

CREATE INDEX idx_factories_name_trgm ON factories USING GIN (name gin_trgm_ops);
CREATE INDEX idx_factories_slug_trgm ON factories USING GIN (slug gin_trgm_ops);
