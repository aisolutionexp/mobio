-- Sprint 8 — Showroom Bookings (retailer books a slot)

CREATE TABLE showroom_bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id      UUID NOT NULL REFERENCES showroom_slots(id) ON DELETE CASCADE,
  retailer_id  UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes        TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_booking_slot_retailer UNIQUE (slot_id, retailer_id)
);

ALTER TABLE showroom_bookings ENABLE ROW LEVEL SECURITY;

-- Retailer members see their own bookings
CREATE POLICY showroom_bookings_select_retailer ON showroom_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = showroom_bookings.retailer_id
        AND team_members.is_active = true
    )
  );

-- Factory members see bookings for their showroom slots
CREATE POLICY showroom_bookings_select_factory ON showroom_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM showroom_slots sl
      JOIN showrooms s ON s.id = sl.showroom_id
      JOIN team_members tm ON tm.factory_id = s.factory_id
      WHERE sl.id = showroom_bookings.slot_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.is_active = true
    )
  );

-- Retailer owner/buyer can create bookings
CREATE POLICY showroom_bookings_insert_retailer ON showroom_bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = showroom_bookings.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Retailer can cancel their own bookings
CREATE POLICY showroom_bookings_update_retailer ON showroom_bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = showroom_bookings.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Factory owner can confirm/cancel bookings for their slots
CREATE POLICY showroom_bookings_update_factory ON showroom_bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM showroom_slots sl
      JOIN showrooms s ON s.id = sl.showroom_id
      JOIN team_members tm ON tm.factory_id = s.factory_id
      WHERE sl.id = showroom_bookings.slot_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.role = 'atelier_owner'
        AND tm.is_active = true
    )
  );

CREATE TRIGGER trg_showroom_bookings_updated_at
  BEFORE UPDATE ON showroom_bookings
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- Trigger: mark slot as unavailable when max_attendees reached
CREATE OR REPLACE FUNCTION fn_booking_update_slot_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_max   INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM showroom_bookings
  WHERE slot_id = NEW.slot_id
    AND status IN ('pending', 'confirmed');

  SELECT max_attendees INTO v_max
  FROM showroom_slots
  WHERE id = NEW.slot_id;

  UPDATE showroom_slots
  SET is_available = (v_count < v_max)
  WHERE id = NEW.slot_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bookings_after_upsert_availability
  AFTER INSERT OR UPDATE OF status ON showroom_bookings
  FOR EACH ROW EXECUTE FUNCTION fn_booking_update_slot_availability();

CREATE INDEX idx_showroom_bookings_slot_status ON showroom_bookings (slot_id, status);
CREATE INDEX idx_showroom_bookings_retailer_status ON showroom_bookings (retailer_id, status);
