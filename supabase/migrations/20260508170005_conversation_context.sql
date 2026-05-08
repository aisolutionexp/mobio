-- Sprint 8 — Conversation context threading (quote / order / showroom_booking)

ALTER TABLE conversations
  ADD COLUMN context_type TEXT
    CHECK (context_type IN ('general', 'quote', 'order', 'showroom_booking')),
  ADD COLUMN context_id UUID;

-- If context_type is set (and not 'general'), context_id is required
ALTER TABLE conversations
  ADD CONSTRAINT chk_conversation_context
    CHECK (
      context_type IS NULL
      OR context_type = 'general'
      OR (context_type IS NOT NULL AND context_id IS NOT NULL)
    );

-- Drop the unique constraint on (factory_id, retailer_id) to allow multiple
-- conversations per pair with different contexts
ALTER TABLE conversations
  DROP CONSTRAINT uq_conversation_pair;

-- Re-add as partial unique: only one 'general' (or NULL context) per pair
CREATE UNIQUE INDEX uq_conversation_pair_general
  ON conversations (factory_id, retailer_id)
  WHERE context_type IS NULL OR context_type = 'general';

-- Allow only one conversation per context entity
CREATE UNIQUE INDEX uq_conversation_context
  ON conversations (factory_id, retailer_id, context_type, context_id)
  WHERE context_type IS NOT NULL AND context_type != 'general';

CREATE INDEX idx_conversations_context ON conversations (factory_id, retailer_id, context_type, context_id);
