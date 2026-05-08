-- Expand invites role CHECK to include all team roles
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_role_check;
ALTER TABLE public.invites ADD CONSTRAINT invites_role_check
  CHECK (role IN ('atelier_owner', 'atelier_member', 'lojista_owner', 'lojista_buyer'));

-- Update tenant constraint to allow owners for both tenant types
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS chk_invite_tenant;
ALTER TABLE public.invites ADD CONSTRAINT chk_invite_tenant CHECK (
  (factory_id IS NOT NULL AND retailer_id IS NULL AND role IN ('atelier_owner', 'atelier_member'))
  OR (factory_id IS NULL AND retailer_id IS NOT NULL AND role IN ('lojista_owner', 'lojista_buyer'))
);
