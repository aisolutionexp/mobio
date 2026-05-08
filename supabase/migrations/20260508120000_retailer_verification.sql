-- Sprint 5 — M1: Verificação de lojistas pelo admin
-- Admin verifica/rejeita retailers. Retailers não-verificados não impactam discover
-- (factories são listadas por is_active, não por verification do retailer).

ALTER TABLE retailers
  ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN verification_notes TEXT,
  ADD COLUMN verified_at TIMESTAMPTZ,
  ADD COLUMN verified_by UUID REFERENCES profiles(id);

CREATE INDEX idx_retailers_verification_status ON retailers (verification_status);
CREATE INDEX idx_retailers_verified_by ON retailers (verified_by);

-- Policy: admin pode ver todos os retailers (inclusive inativos) para painel de verificação
CREATE POLICY retailers_select_admin ON retailers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.role = 'admin'
        AND team_members.is_active = true
    )
  );

-- Policy: admin pode atualizar retailers (verificação)
CREATE POLICY retailers_update_admin ON retailers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.role = 'admin'
        AND team_members.is_active = true
    )
  );
