-- Sprint 3 — A14: Plans + Subscriptions

CREATE TABLE plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  type        TEXT NOT NULL CHECK (type IN ('atelier', 'lojista')),
  price_cents BIGINT NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'BRL',
  features    JSONB NOT NULL DEFAULT '[]',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see active plans
CREATE POLICY plans_select_all ON plans
  FOR SELECT USING (
    is_active = true AND (SELECT auth.uid()) IS NOT NULL
  );

-- Insert/Update/Delete: service_role only (admin panel)

CREATE TRIGGER trg_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_plans_slug ON plans (slug);
CREATE INDEX idx_plans_type ON plans (type);
CREATE INDEX idx_plans_is_active ON plans (is_active);

-- Subscriptions
CREATE TABLE subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL,
  tenant_type          TEXT NOT NULL CHECK (tenant_type IN ('factory', 'retailer')),
  plan_id              UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  status               TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end   TIMESTAMPTZ NOT NULL,
  cancelled_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at           TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- One active subscription per tenant
  CONSTRAINT uq_tenant_subscription UNIQUE (tenant_id, tenant_type)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Members of the tenant can see their subscription
CREATE POLICY subscriptions_select_factory ON subscriptions
  FOR SELECT USING (
    tenant_type = 'factory' AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = subscriptions.tenant_id
        AND team_members.is_active = true
    )
  );

CREATE POLICY subscriptions_select_retailer ON subscriptions
  FOR SELECT USING (
    tenant_type = 'retailer' AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = subscriptions.tenant_id
        AND team_members.is_active = true
    )
  );

-- Insert/Update/Delete: service_role only (payment webhook)

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_subscriptions_tenant ON subscriptions (tenant_id, tenant_type);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions (plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);
