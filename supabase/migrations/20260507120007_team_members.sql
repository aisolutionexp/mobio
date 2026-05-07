-- Migration 0008: Team Members
-- Relacionamento user-tenant com role. Fonte de verdade para RBAC.
-- Um usuário pode ter múltiplas entradas (um por tenant que participa).
-- factory_id XOR retailer_id — nunca ambos (um member pertence a factory OU retailer).

CREATE TABLE team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- ON DELETE RESTRICT: factories/retailers NUNCA devem ser hard-deleted enquanto
  -- houver team_members vinculados. Usar soft-delete (is_active=false) no tenant.
  -- SET NULL é incompatível com chk_tenant_xor (exige factory_id NOT NULL para roles atelier_*).
  factory_id  UUID REFERENCES factories(id) ON DELETE RESTRICT,
  retailer_id UUID REFERENCES retailers(id) ON DELETE RESTRICT,
  role        TEXT NOT NULL CHECK (role IN (
    'atelier_owner', 'atelier_member', 'lojista_owner', 'lojista_buyer', 'admin'
  )),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  joined_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Garante que factory_id XOR retailer_id (exceto admin que pode ter ambos null)
  CONSTRAINT chk_tenant_xor CHECK (
    (factory_id IS NOT NULL AND retailer_id IS NULL AND role IN ('atelier_owner', 'atelier_member'))
    OR (factory_id IS NULL AND retailer_id IS NOT NULL AND role IN ('lojista_owner', 'lojista_buyer'))
    OR (factory_id IS NULL AND retailer_id IS NULL AND role = 'admin')
  ),

  -- Um usuário tem apenas um papel por tenant
  CONSTRAINT uq_user_factory UNIQUE (user_id, factory_id),
  CONSTRAINT uq_user_retailer UNIQUE (user_id, retailer_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Usuário vê suas próprias memberships
CREATE POLICY team_members_select_own ON team_members
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Owner da factory/retailer vê membros do seu tenant
CREATE POLICY team_members_select_factory_owner ON team_members
  FOR SELECT USING (
    factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = (SELECT auth.uid())
        AND tm.factory_id = team_members.factory_id
        AND tm.role = 'atelier_owner'
        AND tm.is_active = true
    )
  );

CREATE POLICY team_members_select_retailer_owner ON team_members
  FOR SELECT USING (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = (SELECT auth.uid())
        AND tm.retailer_id = team_members.retailer_id
        AND tm.role = 'lojista_owner'
        AND tm.is_active = true
    )
  );

-- Inserção: apenas service_role (signup flow via Server Action ou invite accept)

-- Owner pode desativar membros do seu tenant (soft deactivation via UPDATE is_active)
CREATE POLICY team_members_update_factory_owner ON team_members
  FOR UPDATE USING (
    factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = (SELECT auth.uid())
        AND tm.factory_id = team_members.factory_id
        AND tm.role = 'atelier_owner'
        AND tm.is_active = true
    )
  ) WITH CHECK (
    factory_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = (SELECT auth.uid())
        AND tm.factory_id = team_members.factory_id
        AND tm.role = 'atelier_owner'
        AND tm.is_active = true
    )
  );

CREATE POLICY team_members_update_retailer_owner ON team_members
  FOR UPDATE USING (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = (SELECT auth.uid())
        AND tm.retailer_id = team_members.retailer_id
        AND tm.role = 'lojista_owner'
        AND tm.is_active = true
    )
  ) WITH CHECK (
    retailer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = (SELECT auth.uid())
        AND tm.retailer_id = team_members.retailer_id
        AND tm.role = 'lojista_owner'
        AND tm.is_active = true
    )
  );

-- Sem DELETE — desativar via is_active = false (soft delete)

CREATE INDEX idx_team_members_user_id ON team_members (user_id);
CREATE INDEX idx_team_members_factory_id ON team_members (factory_id);
CREATE INDEX idx_team_members_retailer_id ON team_members (retailer_id);
CREATE INDEX idx_team_members_role ON team_members (role);
CREATE INDEX idx_team_members_is_active ON team_members (is_active);
CREATE INDEX idx_team_members_user_factory ON team_members (user_id, factory_id);
CREATE INDEX idx_team_members_user_retailer ON team_members (user_id, retailer_id);
