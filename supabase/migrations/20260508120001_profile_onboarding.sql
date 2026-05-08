-- Sprint 5 — M2: Onboarding state em profiles
-- Rastreia progresso do onboarding pós-aceite (primeiro acesso após signup ou convite).
-- Steps: pending → profile → preferences → completed

ALTER TABLE profiles
  ADD COLUMN onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN onboarding_step TEXT NOT NULL DEFAULT 'pending'
    CHECK (onboarding_step IN ('pending', 'profile', 'preferences', 'completed'));

-- Partial index: só indexa perfis que ainda não completaram onboarding
-- (queries filtram "quem precisa completar onboarding" — não "quem já completou")
CREATE INDEX idx_profiles_onboarding_step ON profiles (onboarding_step)
  WHERE onboarding_step != 'completed';
