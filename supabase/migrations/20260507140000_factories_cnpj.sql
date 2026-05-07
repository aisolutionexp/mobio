-- Sprint 3 — A1: Add cnpj column to factories
-- Resolves pending decision from Sprint 1: Edge Functions receive cnpj but column did not exist.
-- Optional (nullable) to avoid breaking existing records.

ALTER TABLE factories ADD COLUMN cnpj CITEXT UNIQUE;

CREATE INDEX idx_factories_cnpj ON factories (cnpj);
