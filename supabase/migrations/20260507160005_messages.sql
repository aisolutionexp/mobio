-- Sprint 4 — Messages (within conversations)

CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body             TEXT NOT NULL,
  attachments      JSONB DEFAULT '[]',
  is_read          BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  edited_at        TIMESTAMPTZ,
  deleted_at       TIMESTAMPTZ
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Members of the conversation's factory can see messages
CREATE POLICY messages_select_factory ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN team_members tm ON tm.factory_id = c.factory_id
      WHERE c.id = messages.conversation_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

-- Members of the conversation's retailer can see messages
CREATE POLICY messages_select_retailer ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN team_members tm ON tm.retailer_id = c.retailer_id
      WHERE c.id = messages.conversation_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

-- Members of either side can send messages
CREATE POLICY messages_insert_factory ON messages
  FOR INSERT WITH CHECK (
    sender_user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM conversations c
      JOIN team_members tm ON tm.factory_id = c.factory_id
      WHERE c.id = messages.conversation_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

CREATE POLICY messages_insert_retailer ON messages
  FOR INSERT WITH CHECK (
    sender_user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM conversations c
      JOIN team_members tm ON tm.retailer_id = c.retailer_id
      WHERE c.id = messages.conversation_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

-- Sender can edit their own message (soft edit via edited_at)
CREATE POLICY messages_update_sender ON messages
  FOR UPDATE USING (
    sender_user_id = (SELECT auth.uid())
    AND deleted_at IS NULL
  );

-- Receiver side can mark as read
CREATE POLICY messages_update_read_factory ON messages
  FOR UPDATE USING (
    sender_user_id != (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM conversations c
      JOIN team_members tm ON tm.factory_id = c.factory_id
      WHERE c.id = messages.conversation_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

CREATE POLICY messages_update_read_retailer ON messages
  FOR UPDATE USING (
    sender_user_id != (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM conversations c
      JOIN team_members tm ON tm.retailer_id = c.retailer_id
      WHERE c.id = messages.conversation_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

-- No hard DELETE: soft delete via deleted_at

-- Trigger to update conversation.last_message_at on new message
CREATE OR REPLACE FUNCTION fn_update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_messages_after_insert_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION fn_update_conversation_last_message();

CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_messages_sender_user_id ON messages (sender_user_id);
CREATE INDEX idx_messages_conversation_created ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_messages_is_read ON messages (is_read);
