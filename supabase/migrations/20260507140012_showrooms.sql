-- Sprint 3 — A13: Showrooms + Attendees

CREATE TABLE showrooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id  UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'physical'
                CHECK (type IN ('physical', 'virtual')),
  description TEXT,
  event_date  TIMESTAMPTZ,
  location    TEXT,
  capacity    INT,
  status      TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'published', 'active', 'ended', 'cancelled')),
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE showrooms ENABLE ROW LEVEL SECURITY;

-- Factory members see their showrooms
CREATE POLICY showrooms_select_factory ON showrooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = showrooms.factory_id
        AND team_members.is_active = true
    )
  );

-- Authenticated users see published/active showrooms (discovery)
CREATE POLICY showrooms_select_public ON showrooms
  FOR SELECT USING (
    status IN ('published', 'active') AND (SELECT auth.uid()) IS NOT NULL
  );

-- Factory owner/member can create
CREATE POLICY showrooms_insert_factory ON showrooms
  FOR INSERT WITH CHECK (
    created_by = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = showrooms.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Factory owner/member can update
CREATE POLICY showrooms_update_factory ON showrooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = showrooms.factory_id
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Only owner can delete (draft only)
CREATE POLICY showrooms_delete_factory ON showrooms
  FOR DELETE USING (
    status = 'draft' AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = showrooms.factory_id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE TRIGGER trg_showrooms_updated_at
  BEFORE UPDATE ON showrooms
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_showrooms_factory_id ON showrooms (factory_id);
CREATE INDEX idx_showrooms_status ON showrooms (status);
CREATE INDEX idx_showrooms_event_date ON showrooms (event_date);
CREATE INDEX idx_showrooms_created_by ON showrooms (created_by);

-- Showroom attendees
CREATE TABLE showroom_attendees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id UUID NOT NULL REFERENCES showrooms(id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'confirmed', 'declined', 'attended')),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_showroom_attendee UNIQUE (showroom_id, retailer_id)
);

ALTER TABLE showroom_attendees ENABLE ROW LEVEL SECURITY;

-- Factory members see attendees of their showrooms
CREATE POLICY showroom_attendees_select_factory ON showroom_attendees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM showrooms
      JOIN team_members ON team_members.factory_id = showrooms.factory_id
      WHERE showrooms.id = showroom_attendees.showroom_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Retailer members see their own attendance records
CREATE POLICY showroom_attendees_select_retailer ON showroom_attendees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = showroom_attendees.retailer_id
        AND team_members.is_active = true
    )
  );

-- Retailer owner/buyer can register attendance
CREATE POLICY showroom_attendees_insert_retailer ON showroom_attendees
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = showroom_attendees.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Retailer can update their status (confirm/decline)
CREATE POLICY showroom_attendees_update_retailer ON showroom_attendees
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = showroom_attendees.retailer_id
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

-- Factory owner can update status (mark attended)
CREATE POLICY showroom_attendees_update_factory ON showroom_attendees
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM showrooms
      JOIN team_members ON team_members.factory_id = showrooms.factory_id
      WHERE showrooms.id = showroom_attendees.showroom_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE TRIGGER trg_showroom_attendees_updated_at
  BEFORE UPDATE ON showroom_attendees
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_showroom_attendees_showroom_id ON showroom_attendees (showroom_id);
CREATE INDEX idx_showroom_attendees_retailer_id ON showroom_attendees (retailer_id);
CREATE INDEX idx_showroom_attendees_status ON showroom_attendees (status);
