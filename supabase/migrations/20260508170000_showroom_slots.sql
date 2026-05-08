-- Sprint 8 — Showroom Slots (time-based scheduling for showrooms)

CREATE TABLE showroom_slots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id      UUID NOT NULL REFERENCES showrooms(id) ON DELETE CASCADE,
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ NOT NULL,
  max_attendees    INT NOT NULL DEFAULT 1,
  is_available     BOOLEAN NOT NULL DEFAULT true,
  location_details TEXT,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT chk_slot_time_range CHECK (ends_at > starts_at)
);

ALTER TABLE showroom_slots ENABLE ROW LEVEL SECURITY;

-- Factory members CRUD
CREATE POLICY showroom_slots_select_factory ON showroom_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM showrooms s
      JOIN team_members tm ON tm.factory_id = s.factory_id
      WHERE s.id = showroom_slots.showroom_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

CREATE POLICY showroom_slots_insert_factory ON showroom_slots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM showrooms s
      JOIN team_members tm ON tm.factory_id = s.factory_id
      WHERE s.id = showroom_slots.showroom_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('atelier_owner', 'atelier_member')
        AND tm.is_active = true
    )
  );

CREATE POLICY showroom_slots_update_factory ON showroom_slots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM showrooms s
      JOIN team_members tm ON tm.factory_id = s.factory_id
      WHERE s.id = showroom_slots.showroom_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('atelier_owner', 'atelier_member')
        AND tm.is_active = true
    )
  );

CREATE POLICY showroom_slots_delete_factory ON showroom_slots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM showrooms s
      JOIN team_members tm ON tm.factory_id = s.factory_id
      WHERE s.id = showroom_slots.showroom_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('atelier_owner', 'atelier_member')
        AND tm.is_active = true
    )
  );

-- Authorized retailers can see available slots of published/active showrooms
CREATE POLICY showroom_slots_select_retailer ON showroom_slots
  FOR SELECT USING (
    is_available = true AND EXISTS (
      SELECT 1 FROM showrooms s
      JOIN authorized_retailers ar ON ar.factory_id = s.factory_id
      JOIN team_members tm ON tm.retailer_id = ar.retailer_id
      WHERE s.id = showroom_slots.showroom_id
        AND s.status IN ('published', 'active')
        AND ar.status = 'active'
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

CREATE TRIGGER trg_showroom_slots_updated_at
  BEFORE UPDATE ON showroom_slots
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_showroom_slots_showroom_starts ON showroom_slots (showroom_id, starts_at);
CREATE INDEX idx_showroom_slots_is_available ON showroom_slots (is_available) WHERE is_available = true;
