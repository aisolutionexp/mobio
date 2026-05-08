-- Sprint 6 — Anotações por item (linesheet_items + board_items)

ALTER TABLE linesheet_items
  ADD COLUMN note TEXT CHECK (length(note) <= 1000);

ALTER TABLE board_items
  ADD COLUMN note TEXT CHECK (length(note) <= 500);
