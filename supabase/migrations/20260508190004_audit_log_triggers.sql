-- Sprint 9 — Generic audit log trigger function + attach to critical tables

CREATE OR REPLACE FUNCTION fn_log_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record_id UUID;
  v_before    JSONB;
  v_after     JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_record_id := OLD.id;
    v_before := to_jsonb(OLD);
    v_after := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_record_id := NEW.id;
    v_before := NULL;
    v_after := to_jsonb(NEW);
  ELSE
    v_record_id := NEW.id;
    v_before := to_jsonb(OLD);
    v_after := to_jsonb(NEW);
  END IF;

  INSERT INTO audit_logs (table_name, operation, record_id, actor_user_id, before_data, after_data)
  VALUES (TG_TABLE_NAME, TG_OP, v_record_id, auth.uid(), v_before, v_after);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach to critical tables
CREATE TRIGGER trg_factories_audit
  AFTER INSERT OR UPDATE OR DELETE ON factories
  FOR EACH ROW EXECUTE FUNCTION fn_log_audit();

CREATE TRIGGER trg_retailers_audit
  AFTER INSERT OR UPDATE OR DELETE ON retailers
  FOR EACH ROW EXECUTE FUNCTION fn_log_audit();

CREATE TRIGGER trg_team_members_audit
  AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW EXECUTE FUNCTION fn_log_audit();

CREATE TRIGGER trg_orders_audit
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_log_audit();

CREATE TRIGGER trg_factory_settings_audit
  AFTER INSERT OR UPDATE OR DELETE ON factory_settings
  FOR EACH ROW EXECUTE FUNCTION fn_log_audit();

CREATE TRIGGER trg_factory_invitations_audit
  AFTER INSERT OR UPDATE OR DELETE ON factory_invitations
  FOR EACH ROW EXECUTE FUNCTION fn_log_audit();

CREATE TRIGGER trg_authorized_retailers_audit
  AFTER INSERT OR UPDATE OR DELETE ON authorized_retailers
  FOR EACH ROW EXECUTE FUNCTION fn_log_audit();

CREATE TRIGGER trg_plans_audit
  AFTER INSERT OR UPDATE OR DELETE ON plans
  FOR EACH ROW EXECUTE FUNCTION fn_log_audit();

CREATE TRIGGER trg_subscriptions_audit
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION fn_log_audit();
