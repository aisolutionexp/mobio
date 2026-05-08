-- Sprint 8 — Message Attachments (polymorphic: conversation messages + quote messages)

CREATE TABLE message_attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      UUID NOT NULL,
  message_type    TEXT NOT NULL CHECK (message_type IN ('conversation', 'quote')),
  storage_path    TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_type       TEXT NOT NULL,
  file_size_bytes INT NOT NULL CHECK (file_size_bytes > 0),
  uploaded_by     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- SELECT: conversation message attachments — factory side
CREATE POLICY message_attachments_select_conv_factory ON message_attachments
  FOR SELECT USING (
    message_type = 'conversation' AND EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      JOIN team_members tm ON tm.factory_id = c.factory_id
      WHERE m.id = message_attachments.message_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

-- SELECT: conversation message attachments — retailer side
CREATE POLICY message_attachments_select_conv_retailer ON message_attachments
  FOR SELECT USING (
    message_type = 'conversation' AND EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      JOIN team_members tm ON tm.retailer_id = c.retailer_id
      WHERE m.id = message_attachments.message_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

-- SELECT: quote message attachments — factory side
CREATE POLICY message_attachments_select_quote_factory ON message_attachments
  FOR SELECT USING (
    message_type = 'quote' AND EXISTS (
      SELECT 1 FROM quote_messages qm
      JOIN quotes q ON q.id = qm.quote_id
      JOIN team_members tm ON tm.factory_id = q.factory_id
      WHERE qm.id = message_attachments.message_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

-- SELECT: quote message attachments — retailer side
CREATE POLICY message_attachments_select_quote_retailer ON message_attachments
  FOR SELECT USING (
    message_type = 'quote' AND EXISTS (
      SELECT 1 FROM quote_messages qm
      JOIN quotes q ON q.id = qm.quote_id
      JOIN team_members tm ON tm.retailer_id = q.retailer_id
      WHERE qm.id = message_attachments.message_id
        AND q.status != 'draft'
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

-- INSERT: only the uploader (sender of the message)
CREATE POLICY message_attachments_insert_own ON message_attachments
  FOR INSERT WITH CHECK (
    uploaded_by = (SELECT auth.uid())
  );

-- No UPDATE or DELETE: attachments are immutable

CREATE INDEX idx_message_attachments_message ON message_attachments (message_id, message_type);
CREATE INDEX idx_message_attachments_uploaded_by ON message_attachments (uploaded_by);
