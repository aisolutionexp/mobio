-- Sprint 7 — Payment Tracking (signal 30% + installment 70%)

CREATE TABLE payment_schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  total_cents BIGINT NOT NULL CHECK (total_cents > 0),
  signal_pct  INT NOT NULL DEFAULT 30 CHECK (signal_pct >= 0 AND signal_pct <= 100),
  due_date    DATE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'paid', 'late', 'cancelled')),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

-- Factory members can see payment schedules of their orders
CREATE POLICY payment_schedules_select_factory ON payment_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN team_members ON team_members.factory_id = orders.factory_id
      WHERE orders.id = payment_schedules.order_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Retailer members can see payment schedules of their orders
CREATE POLICY payment_schedules_select_retailer ON payment_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN team_members ON team_members.retailer_id = orders.retailer_id
      WHERE orders.id = payment_schedules.order_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Factory owner can create payment schedules
CREATE POLICY payment_schedules_insert_factory ON payment_schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN team_members ON team_members.factory_id = orders.factory_id
      WHERE orders.id = payment_schedules.order_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- Factory owner can update payment schedules
CREATE POLICY payment_schedules_update_factory ON payment_schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN team_members ON team_members.factory_id = orders.factory_id
      WHERE orders.id = payment_schedules.order_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

CREATE TRIGGER trg_payment_schedules_updated_at
  BEFORE UPDATE ON payment_schedules
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_payment_schedules_order_id ON payment_schedules (order_id);
CREATE INDEX idx_payment_schedules_status ON payment_schedules (status);

-- Payment Records (individual payments against a schedule)

CREATE TABLE payment_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id     UUID NOT NULL REFERENCES payment_schedules(id) ON DELETE CASCADE,
  amount_cents    BIGINT NOT NULL CHECK (amount_cents > 0),
  paid_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('pix', 'boleto', 'transfer', 'credit_card', 'other')),
  transaction_ref TEXT,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Factory members can see payment records of their orders
CREATE POLICY payment_records_select_factory ON payment_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payment_schedules ps
      JOIN orders ON orders.id = ps.order_id
      JOIN team_members ON team_members.factory_id = orders.factory_id
      WHERE ps.id = payment_records.schedule_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Retailer members can see payment records of their orders
CREATE POLICY payment_records_select_retailer ON payment_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payment_schedules ps
      JOIN orders ON orders.id = ps.order_id
      JOIN team_members ON team_members.retailer_id = orders.retailer_id
      WHERE ps.id = payment_records.schedule_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.is_active = true
    )
  );

-- Factory can record payments
CREATE POLICY payment_records_insert_factory ON payment_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM payment_schedules ps
      JOIN orders ON orders.id = ps.order_id
      JOIN team_members ON team_members.factory_id = orders.factory_id
      WHERE ps.id = payment_records.schedule_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_payment_records_schedule_id ON payment_records (schedule_id);
CREATE INDEX idx_payment_records_paid_at ON payment_records (paid_at);
