-- Sprint 8 — Storage Buckets for message attachments + retailer documents

INSERT INTO storage.buckets (id, name, public) VALUES
  ('message-attachments', 'message-attachments', false),
  ('retailer-documents', 'retailer-documents', false);

-- ============================================================
-- MESSAGE-ATTACHMENTS (private bucket)
-- Path pattern: {conversation_id_or_quote_id}/{message_id}/{filename}
-- Access controlled via conversation/quote membership
-- ============================================================

-- Factory members can read attachments from their conversations
CREATE POLICY msg_attachments_select_factory ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments'
    AND (SELECT auth.uid()) IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM conversations c
        JOIN team_members tm ON tm.factory_id = c.factory_id
        WHERE c.id = ((storage.foldername(name))[1])::UUID
          AND tm.user_id = (SELECT auth.uid())
          AND tm.is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM quotes q
        JOIN team_members tm ON tm.factory_id = q.factory_id
        WHERE q.id = ((storage.foldername(name))[1])::UUID
          AND tm.user_id = (SELECT auth.uid())
          AND tm.is_active = true
      )
    )
  );

-- Retailer members can read attachments from their conversations
CREATE POLICY msg_attachments_select_retailer ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments'
    AND (SELECT auth.uid()) IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM conversations c
        JOIN team_members tm ON tm.retailer_id = c.retailer_id
        WHERE c.id = ((storage.foldername(name))[1])::UUID
          AND tm.user_id = (SELECT auth.uid())
          AND tm.is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM quotes q
        JOIN team_members tm ON tm.retailer_id = q.retailer_id
        WHERE q.id = ((storage.foldername(name))[1])::UUID
          AND tm.user_id = (SELECT auth.uid())
          AND tm.is_active = true
      )
    )
  );

-- Authenticated users can upload to message-attachments (sender check at app layer)
CREATE POLICY msg_attachments_insert_authenticated ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-attachments'
    AND (SELECT auth.uid()) IS NOT NULL
  );

-- ============================================================
-- RETAILER-DOCUMENTS (private bucket)
-- Path pattern: {retailer_id}/{doc_type}/{filename}
-- ============================================================

-- Retailer members can read their own docs
CREATE POLICY retailer_docs_select_retailer ON storage.objects
  FOR SELECT USING (
    bucket_id = 'retailer-documents'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = ((storage.foldername(name))[1])::UUID
        AND team_members.is_active = true
    )
  );

-- Factory owner of authorized factory can read retailer docs
CREATE POLICY retailer_docs_select_factory ON storage.objects
  FOR SELECT USING (
    bucket_id = 'retailer-documents'
    AND EXISTS (
      SELECT 1 FROM authorized_retailers ar
      JOIN team_members tm ON tm.factory_id = ar.factory_id
      WHERE ar.retailer_id = ((storage.foldername(name))[1])::UUID
        AND ar.status = 'active'
        AND tm.user_id = (SELECT auth.uid())
        AND tm.role = 'atelier_owner'
        AND tm.is_active = true
    )
  );

-- Retailer owner can upload docs
CREATE POLICY retailer_docs_insert_owner ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'retailer-documents'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

-- Retailer owner can update docs
CREATE POLICY retailer_docs_update_owner ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'retailer-documents'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );

-- Retailer owner can delete docs
CREATE POLICY retailer_docs_delete_owner ON storage.objects
  FOR DELETE USING (
    bucket_id = 'retailer-documents'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role = 'lojista_owner'
        AND team_members.is_active = true
    )
  );
