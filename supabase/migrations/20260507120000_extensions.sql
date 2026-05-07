-- Migration 0001: Extensões necessárias
-- pg_trgm: busca fuzzy (LIKE, trigram similarity)
-- pgcrypto: gen_random_bytes() para tokens criptográficos
-- citext: case-insensitive text (e-mails, slugs)

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
