-- Migration 0017: Auth Hook + Policies/Triggers que dependem de team_members
-- Esta migration consolida:
-- 1. fn_update_timestamp (trigger genérico para updated_at)
-- 2. Policies de UPDATE em factories/retailers (dependem de team_members)
-- 3. Policy profiles_select_team (depende de team_members)
-- 4. Auth Hook: custom_access_token_hook

-- ============================================================================
-- 1. Trigger genérico para updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar em todas as tabelas
CREATE TRIGGER trg_regions_updated_at
  BEFORE UPDATE ON regions
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_factories_updated_at
  BEFORE UPDATE ON factories
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_retailers_updated_at
  BEFORE UPDATE ON retailers
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_product_images_updated_at
  BEFORE UPDATE ON product_images
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_finishes_updated_at
  BEFORE UPDATE ON finishes
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_product_specs_updated_at
  BEFORE UPDATE ON product_specs
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- ============================================================================
-- 2. Policies de UPDATE em factories (dependem de team_members)
-- ============================================================================

CREATE POLICY factories_update_owner ON factories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = factories.id
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  ) WITH CHECK (
    -- Impede alteração de campos imutáveis: id, created_by, created_at
    id = (SELECT f.id FROM factories f WHERE f.id = factories.id)
    AND created_by = (SELECT f.created_by FROM factories f WHERE f.id = factories.id)
    AND created_at = (SELECT f.created_at FROM factories f WHERE f.id = factories.id)
  );

-- ============================================================================
-- 3. Policies de UPDATE em retailers (dependem de team_members)
-- ============================================================================

CREATE POLICY retailers_update_owner ON retailers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = retailers.id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  ) WITH CHECK (
    -- Impede alteração de campos imutáveis: id, created_by, created_at
    id = (SELECT r.id FROM retailers r WHERE r.id = retailers.id)
    AND created_by = (SELECT r.created_by FROM retailers r WHERE r.id = retailers.id)
    AND created_at = (SELECT r.created_at FROM retailers r WHERE r.id = retailers.id)
  );

-- ============================================================================
-- 4. Policy de SELECT em profiles (membros do mesmo tenant)
-- ============================================================================

CREATE POLICY profiles_select_team ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON (
        (tm1.factory_id IS NOT NULL AND tm1.factory_id = tm2.factory_id) OR
        (tm1.retailer_id IS NOT NULL AND tm1.retailer_id = tm2.retailer_id)
      )
      WHERE tm1.user_id = (SELECT auth.uid())
        AND tm2.user_id = profiles.id
        AND tm1.is_active = true
        AND tm2.is_active = true
    )
  );

-- ============================================================================
-- 5. Auth Hook: custom_access_token_hook
-- ============================================================================
-- Supabase Auth Hook que injeta custom claims no JWT.
-- Registrar no Supabase Dashboard: Authentication → Hooks → Custom Access Token Hook
-- Selecionar: schema "public", function "custom_access_token_hook"
--
-- Claims injetados em app_metadata:
-- {
--   "roles": [{ "tenant_id": "uuid", "role": "atelier_owner" }, ...],
--   "active_tenant_id": "uuid" | null,
--   "active_role": "atelier_owner" | null
-- }
--
-- Regras:
-- - Se usuário tem team_members ativos: popula roles com todos os tenants
-- - active_tenant_id e active_role: usa o primeiro role encontrado (signup flow)
--   ou o valor já existente no app_metadata (troca de tenant via Server Action)
-- - Se admin sem tenant: roles=[{"role":"admin"}], active_tenant_id=null
-- - SECURITY DEFINER: necessário para ler team_members sem RLS
-- - SET search_path = public: segurança contra search_path hijacking

CREATE OR REPLACE FUNCTION custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     UUID;
  v_claims      JSONB;
  v_roles       JSONB;
  v_active_tid  TEXT;
  v_active_role TEXT;
  v_first_role  RECORD;
BEGIN
  v_user_id := (event->>'user_id')::UUID;

  -- Buscar todos os roles ativos do usuário
  SELECT jsonb_agg(
    jsonb_build_object(
      'tenant_id', COALESCE(tm.factory_id, tm.retailer_id),
      'tenant_type', CASE
        WHEN tm.factory_id IS NOT NULL THEN 'factory'
        WHEN tm.retailer_id IS NOT NULL THEN 'retailer'
        ELSE 'platform'
      END,
      'role', tm.role
    )
  )
  INTO v_roles
  FROM team_members tm
  WHERE tm.user_id = v_user_id
    AND tm.is_active = true;

  -- Se sem memberships: retorna evento sem modificar claims
  IF v_roles IS NULL THEN
    v_roles := '[]'::JSONB;
  END IF;

  -- Tentar preservar active_tenant_id existente (troca de tenant via Server Action)
  v_active_tid := event->'claims'->'app_metadata'->>'active_tenant_id';
  v_active_role := event->'claims'->'app_metadata'->>'active_role';

  -- Se não há active_tenant_id ou o tenant não está mais nos roles ativos: usar o primeiro
  IF v_active_tid IS NULL OR NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_roles) r
    WHERE r->>'tenant_id' = v_active_tid
  ) THEN
    SELECT tm.factory_id, tm.retailer_id, tm.role
    INTO v_first_role
    FROM team_members tm
    WHERE tm.user_id = v_user_id
      AND tm.is_active = true
    ORDER BY tm.joined_at ASC
    LIMIT 1;

    IF v_first_role IS NOT NULL THEN
      v_active_tid := COALESCE(v_first_role.factory_id, v_first_role.retailer_id)::TEXT;
      v_active_role := v_first_role.role;
    ELSE
      v_active_tid := NULL;
      v_active_role := NULL;
    END IF;
  END IF;

  -- Montar claims
  v_claims := jsonb_build_object(
    'roles', v_roles,
    'active_tenant_id', v_active_tid,
    'active_role', v_active_role
  );

  -- Injetar em app_metadata
  event := jsonb_set(
    event,
    '{claims, app_metadata}',
    COALESCE(event->'claims'->'app_metadata', '{}'::JSONB) || v_claims
  );

  RETURN event;
END;
$$;

-- Conceder permissão ao supabase_auth_admin para chamar o hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION custom_access_token_hook TO supabase_auth_admin;

-- Revogar acesso de outros roles (segurança)
REVOKE EXECUTE ON FUNCTION custom_access_token_hook FROM authenticated, anon, public;
