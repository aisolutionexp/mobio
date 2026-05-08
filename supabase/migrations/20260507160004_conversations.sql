-- Sprint 4 — Conversations (factory ↔ retailer messaging base)
-- Will be expanded in Sprint 8.

CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id      UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  retailer_id     UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'archived')),
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_conversation_pair UNIQUE (factory_id, retailer_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Factory members can see conversations for their factory
CREATE POLICY conversations_select_factory ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = conversations.factory_id
        AND team_members.is_active = true
    )
  );

-- Retailer members can see conversations for their retailer
CREATE POLICY conversations_select_retailer ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = conversations.retailer_id
        AND team_members.is_active = true
    )
  );

-- Either side can initiate a conversation (insert)
CREATE POLICY conversations_insert_factory ON conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = conversations.factory_id
        AND team_members.is_active = true
    )
  );

CREATE POLICY conversations_insert_retailer ON conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = conversations.retailer_id
        AND team_members.is_active = true
    )
  );

-- Either side can update (archive)
CREATE POLICY conversations_update_factory ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = conversations.factory_id
        AND team_members.is_active = true
    )
  );

CREATE POLICY conversations_update_retailer ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = conversations.retailer_id
        AND team_members.is_active = true
    )
  );

-- No DELETE: conversations are archived, not deleted

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_conversations_factory_id ON conversations (factory_id);
CREATE INDEX idx_conversations_retailer_id ON conversations (retailer_id);
CREATE INDEX idx_conversations_status ON conversations (status);
CREATE INDEX idx_conversations_last_message_at ON conversations (last_message_at DESC);
