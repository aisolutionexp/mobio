-- Sprint 8 — Retailer Documents (CNPJ, contrato social, etc.)

CREATE TABLE retailer_documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id  UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  doc_type     TEXT NOT NULL
                 CHECK (doc_type IN ('cnpj_card', 'contrato_social', 'inscricao_estadual', 'outros')),
  file_name    TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  verified_at  TIMESTAMPTZ,
  verified_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE retailer_documents ENABLE ROW LEVEL SECURITY;

-- Retailer members can see their own documents
CREATE POLICY retailer_documents_select_retailer ON retailer_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = retailer_documents.retailer_id
        AND team_members.is_active = true
    )
  );

-- Factory members of authorized factories can see retailer docs (for verification)
CREATE POLICY retailer_documents_select_factory ON retailer_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM authorized_retailers ar
      JOIN team_members tm ON tm.factory_id = ar.factory_id
      WHERE ar.retailer_id = retailer_documents.retailer_id
        AND ar.status = 'active'
        AND tm.user_id = (SELECT auth.uid())
        AND tm.role = 'atelier_owner'
        AND tm.is_active = true
    )
  );

-- Retailer owner can upload documents
CREATE POLICY retailer_documents_insert_retailer ON retailer_documents
  FOR INSERT WITH CHECK (
    uploaded_by = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = retailer_documents.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

-- Retailer owner can update (re-upload)
CREATE POLICY retailer_documents_update_retailer ON retailer_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = retailer_documents.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

-- Retailer owner can delete their documents
CREATE POLICY retailer_documents_delete_retailer ON retailer_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = retailer_documents.retailer_id
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

CREATE INDEX idx_retailer_documents_retailer_type ON retailer_documents (retailer_id, doc_type);
CREATE INDEX idx_retailer_documents_uploaded_by ON retailer_documents (uploaded_by);
