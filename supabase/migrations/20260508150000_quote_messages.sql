-- Sprint 7 — Quote Messages (chat within a quote negotiation)

CREATE TABLE quote_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  sender_user_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body            TEXT NOT NULL CHECK (char_length(body) <= 5000),
  attachments     JSONB NOT NULL DEFAULT '[]',
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE quote_messages ENABLE ROW LEVEL SECURITY;

-- Factory members can read messages of their quotes
CREATE POLICY quote_messages_select_factory ON quote_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quotes
      JOIN team_members ON team_members.factory_id = quotes.factory_id
      WHERE quotes.id = quote_messages.quote_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Retailer members can read messages of quotes sent to them (non-draft)
CREATE POLICY quote_messages_select_retailer ON quote_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quotes
      JOIN team_members ON team_members.retailer_id = quotes.retailer_id
      WHERE quotes.id = quote_messages.quote_id
        AND quotes.status != 'draft'
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Factory members can send messages on their quotes
CREATE POLICY quote_messages_insert_factory ON quote_messages
  FOR INSERT WITH CHECK (
    sender_user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM quotes
      JOIN team_members ON team_members.factory_id = quotes.factory_id
      WHERE quotes.id = quote_messages.quote_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Retailer members can send messages on non-draft quotes
CREATE POLICY quote_messages_insert_retailer ON quote_messages
  FOR INSERT WITH CHECK (
    sender_user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM quotes
      JOIN team_members ON team_members.retailer_id = quotes.retailer_id
      WHERE quotes.id = quote_messages.quote_id
        AND quotes.status != 'draft'
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Recipient can mark messages as read
CREATE POLICY quote_messages_update_read ON quote_messages
  FOR UPDATE USING (
    sender_user_id != (SELECT auth.uid()) AND (
      EXISTS (
        SELECT 1 FROM quotes
        JOIN team_members ON team_members.factory_id = quotes.factory_id
        WHERE quotes.id = quote_messages.quote_id
          AND team_members.user_id = (SELECT auth.uid())
          AND team_members.is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM quotes
        JOIN team_members ON team_members.retailer_id = quotes.retailer_id
        WHERE quotes.id = quote_messages.quote_id
          AND quotes.status != 'draft'
          AND team_members.user_id = (SELECT auth.uid())
          AND team_members.is_active = true
      )
    )
  )
  WITH CHECK (is_read = true);

-- Trigger: update quote.updated_at when a message is inserted
CREATE OR REPLACE FUNCTION fn_quote_message_touch_quote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE quotes SET updated_at = now() WHERE id = NEW.quote_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_quote_messages_after_insert_touch_quote
  AFTER INSERT ON quote_messages
  FOR EACH ROW EXECUTE FUNCTION fn_quote_message_touch_quote();

CREATE INDEX idx_quote_messages_quote_created ON quote_messages (quote_id, created_at DESC);
CREATE INDEX idx_quote_messages_sender ON quote_messages (sender_user_id);
