-- Sprint 8 — Full-text search on messages

ALTER TABLE messages
  ADD COLUMN body_tsv tsvector
    GENERATED ALWAYS AS (to_tsvector('portuguese', body)) STORED;

CREATE INDEX idx_messages_body_tsv ON messages USING GIN (body_tsv);

-- RPC: search messages within a conversation (respects RLS via SECURITY DEFINER + explicit check)
CREATE OR REPLACE FUNCTION search_messages(
  p_query           TEXT,
  p_conversation_id UUID
)
RETURNS SETOF messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();

  -- Verify caller is a member of the conversation
  IF NOT EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = p_conversation_id
      AND (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.user_id = v_uid
            AND tm.factory_id = c.factory_id
            AND tm.is_active = true
        )
        OR EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.user_id = v_uid
            AND tm.retailer_id = c.retailer_id
            AND tm.is_active = true
        )
      )
  ) THEN
    RAISE EXCEPTION 'Access denied: not a member of this conversation';
  END IF;

  RETURN QUERY
    SELECT m.*
    FROM messages m
    WHERE m.conversation_id = p_conversation_id
      AND m.deleted_at IS NULL
      AND m.body_tsv @@ plainto_tsquery('portuguese', p_query)
    ORDER BY ts_rank(m.body_tsv, plainto_tsquery('portuguese', p_query)) DESC,
             m.created_at DESC;
END;
$$;
