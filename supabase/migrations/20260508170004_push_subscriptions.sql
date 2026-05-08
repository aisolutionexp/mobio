-- Sprint 8 — Push Subscriptions (Web Push VAPID)

CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  user_agent  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_push_subscription_endpoint UNIQUE (user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- User sees only their own subscriptions
CREATE POLICY push_subscriptions_select_own ON push_subscriptions
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
  );

-- User can register a subscription
CREATE POLICY push_subscriptions_insert_own ON push_subscriptions
  FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid())
  );

-- User can update their subscriptions (deactivate, update last_used_at)
CREATE POLICY push_subscriptions_update_own ON push_subscriptions
  FOR UPDATE USING (
    user_id = (SELECT auth.uid())
  );

-- User can delete their subscriptions
CREATE POLICY push_subscriptions_delete_own ON push_subscriptions
  FOR DELETE USING (
    user_id = (SELECT auth.uid())
  );

CREATE INDEX idx_push_subscriptions_user_active ON push_subscriptions (user_id) WHERE is_active = true;
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions (endpoint);
