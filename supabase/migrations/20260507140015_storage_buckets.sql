-- Sprint 3 — C: Storage buckets + RLS policies

-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-photos', 'product-photos', false),
  ('avatars', 'avatars', true),
  ('board-covers', 'board-covers', false),
  ('factory-logos', 'factory-logos', true);

-- ============================================================
-- AVATARS (public bucket)
-- Path pattern: {user_id}/{filename}
-- ============================================================

-- Anyone can read (public bucket)
CREATE POLICY avatars_select_all ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars'
  );

-- User can upload/update their own avatar
CREATE POLICY avatars_insert_own ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

CREATE POLICY avatars_update_own ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

CREATE POLICY avatars_delete_own ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

-- ============================================================
-- FACTORY-LOGOS (public bucket)
-- Path pattern: {factory_id}/{filename}
-- ============================================================

-- Anyone can read (public bucket)
CREATE POLICY factory_logos_select_all ON storage.objects
  FOR SELECT USING (
    bucket_id = 'factory-logos'
  );

-- Factory owner can upload/update/delete logos
CREATE POLICY factory_logos_insert_owner ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'factory-logos'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE POLICY factory_logos_update_owner ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'factory-logos'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

CREATE POLICY factory_logos_delete_owner ON storage.objects
  FOR DELETE USING (
    bucket_id = 'factory-logos'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role = 'atelier_owner'
        AND team_members.is_active = true
    )
  );

-- ============================================================
-- PRODUCT-PHOTOS (private bucket)
-- Path pattern: {factory_id}/{product_id}/{filename}
-- ============================================================

-- Authenticated users can view product photos (catalogue browsing)
CREATE POLICY product_photos_select_authenticated ON storage.objects
  FOR SELECT USING (
    bucket_id = 'product-photos'
    AND (SELECT auth.uid()) IS NOT NULL
  );

-- Factory owner/member can upload product photos
CREATE POLICY product_photos_insert_factory ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-photos'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

CREATE POLICY product_photos_update_factory ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-photos'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

CREATE POLICY product_photos_delete_factory ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-photos'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.factory_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role IN ('atelier_owner', 'atelier_member')
        AND team_members.is_active = true
    )
  );

-- ============================================================
-- BOARD-COVERS (private bucket)
-- Path pattern: {retailer_id}/{board_id}/{filename}
-- ============================================================

-- Only board owner's retailer members can view
CREATE POLICY board_covers_select_member ON storage.objects
  FOR SELECT USING (
    bucket_id = 'board-covers'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = ((storage.foldername(name))[1])::UUID
        AND team_members.is_active = true
    )
  );

-- Retailer owner/buyer can upload covers
CREATE POLICY board_covers_insert_member ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'board-covers'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

CREATE POLICY board_covers_update_member ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'board-covers'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );

CREATE POLICY board_covers_delete_member ON storage.objects
  FOR DELETE USING (
    bucket_id = 'board-covers'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = (SELECT auth.uid())
        AND team_members.retailer_id = ((storage.foldername(name))[1])::UUID
        AND team_members.role IN ('lojista_owner', 'lojista_buyer')
        AND team_members.is_active = true
    )
  );
