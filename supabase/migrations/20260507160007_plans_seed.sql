-- Sprint 4 — Plans Seed Data
-- Idempotent: ON CONFLICT DO NOTHING

INSERT INTO plans (name, slug, type, price_cents, currency, features, is_active) VALUES
  (
    'Atelier Free',
    'atelier-free',
    'atelier',
    0,
    'BRL',
    '{"catalogo_basico": true, "max_colecoes": 1, "linesheets": false, "showrooms": false, "analytics": false, "max_produtos": 50}'::JSONB,
    true
  ),
  (
    'Atelier Pro',
    'atelier-pro',
    'atelier',
    14900,
    'BRL',
    '{"catalogo_basico": true, "max_colecoes": null, "linesheets": true, "showrooms": true, "analytics": true, "max_produtos": null}'::JSONB,
    true
  ),
  (
    'Atelier Business',
    'atelier-business',
    'atelier',
    29900,
    'BRL',
    '{"catalogo_basico": true, "max_colecoes": null, "linesheets": true, "showrooms": true, "analytics": true, "max_produtos": null, "api_access": true, "priority_support": true}'::JSONB,
    true
  ),
  (
    'Lojista Free',
    'lojista-free',
    'lojista',
    0,
    'BRL',
    '{"discover": true, "favoritos": true, "max_boards": 1, "quotes": false, "analytics": false}'::JSONB,
    true
  ),
  (
    'Lojista Plus',
    'lojista-plus',
    'lojista',
    9900,
    'BRL',
    '{"discover": true, "favoritos": true, "max_boards": null, "quotes": true, "analytics": true, "prioridade_showroom": true}'::JSONB,
    true
  )
ON CONFLICT (slug) DO NOTHING;
