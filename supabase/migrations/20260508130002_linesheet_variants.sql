-- Sprint 6 — Variantes de pricing na linesheet + MSRP em products

ALTER TABLE linesheets
  ADD COLUMN pricing_variant TEXT NOT NULL DEFAULT 'retailer'
    CHECK (pricing_variant IN ('retailer', 'msrp', 'custom'));

ALTER TABLE products
  ADD COLUMN msrp NUMERIC(10, 2);
