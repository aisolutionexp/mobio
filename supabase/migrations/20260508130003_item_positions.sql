-- Sprint 6 — Garantir índices compostos em (parent_id, position)
-- board_items.position e linesheet_items.position já existem (Sprint 3)

CREATE INDEX IF NOT EXISTS idx_board_items_board_position
  ON board_items (board_id, position);

CREATE INDEX IF NOT EXISTS idx_linesheet_items_linesheet_position
  ON linesheet_items (linesheet_id, position);

-- Auto-position: ao inserir, preenche position = max + 1 dentro do parent
CREATE OR REPLACE FUNCTION fn_auto_position_board_item()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.position = 0 THEN
    SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
    FROM board_items
    WHERE board_id = NEW.board_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_auto_position_linesheet_item()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.position = 0 THEN
    SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
    FROM linesheet_items
    WHERE linesheet_id = NEW.linesheet_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_board_items_auto_position
  BEFORE INSERT ON board_items
  FOR EACH ROW EXECUTE FUNCTION fn_auto_position_board_item();

CREATE TRIGGER trg_linesheet_items_auto_position
  BEFORE INSERT ON linesheet_items
  FOR EACH ROW EXECUTE FUNCTION fn_auto_position_linesheet_item();
