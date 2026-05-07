-- Sprint 3 — A8: Notifications

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  link       TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User sees only their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
  );

-- Insert: service_role only (triggers, Edge Functions, Server Actions)

-- User can mark their notifications as read
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (
    user_id = (SELECT auth.uid())
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
  );

CREATE INDEX idx_notifications_user_id_is_read ON notifications (user_id, is_read);
CREATE INDEX idx_notifications_user_id_created_at ON notifications (user_id, created_at DESC);
