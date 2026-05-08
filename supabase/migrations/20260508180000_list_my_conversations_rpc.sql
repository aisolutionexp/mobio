CREATE OR REPLACE FUNCTION public.list_my_conversations(p_user_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  factory_id UUID,
  retailer_id UUID,
  context_type TEXT,
  context_id UUID,
  last_message_body TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH my_conversations AS (
    SELECT c.id, c.factory_id, c.retailer_id, c.context_type, c.context_id
    FROM conversations c
    WHERE EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = p_user_id
      AND tm.is_active = true
      AND ((tm.factory_id = c.factory_id) OR (tm.retailer_id = c.retailer_id))
    )
    AND c.status = 'active'
  ),
  last_msgs AS (
    SELECT DISTINCT ON (m.conversation_id)
      m.conversation_id,
      m.body,
      m.created_at
    FROM messages m
    WHERE m.conversation_id IN (SELECT id FROM my_conversations)
    AND m.deleted_at IS NULL
    ORDER BY m.conversation_id, m.created_at DESC
  ),
  unread AS (
    SELECT
      m.conversation_id,
      COUNT(*) AS cnt
    FROM messages m
    WHERE m.conversation_id IN (SELECT id FROM my_conversations)
    AND m.is_read = false
    AND m.sender_user_id != p_user_id
    GROUP BY m.conversation_id
  )
  SELECT
    mc.id,
    mc.factory_id,
    mc.retailer_id,
    mc.context_type,
    mc.context_id,
    lm.body,
    lm.created_at,
    COALESCE(u.cnt, 0)
  FROM my_conversations mc
  LEFT JOIN last_msgs lm ON lm.conversation_id = mc.id
  LEFT JOIN unread u ON u.conversation_id = mc.id
  ORDER BY lm.created_at DESC NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.list_my_conversations FROM public;
GRANT EXECUTE ON FUNCTION public.list_my_conversations TO authenticated;
