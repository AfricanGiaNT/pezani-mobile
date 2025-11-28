-- Pezani Estates RLS Policies
-- Task 5: Supabase Auth Setup - Row Level Security

-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Everyone can read all profiles (for displaying landlord/agent names)
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
TO public
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- PROPERTIES TABLE POLICIES
-- ============================================

-- Everyone can read available properties
CREATE POLICY "Available properties are viewable by everyone"
ON properties FOR SELECT
TO public
USING (status = 'available');

-- Authenticated users can read all properties (for dashboards)
CREATE POLICY "Authenticated users can read all properties"
ON properties FOR SELECT
TO authenticated
USING (true);

-- Property owners can insert their own properties
CREATE POLICY "Users can insert own properties"
ON properties FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Property owners can update their own properties
CREATE POLICY "Users can update own properties"
ON properties FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Property owners can delete their own properties
CREATE POLICY "Users can delete own properties"
ON properties FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- Admins can do everything on properties
CREATE POLICY "Admins can manage all properties"
ON properties FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- PROPERTY_IMAGES TABLE POLICIES
-- ============================================

-- Everyone can read property images (for displaying)
CREATE POLICY "Property images are viewable by everyone"
ON property_images FOR SELECT
TO public
USING (true);

-- Property owners can insert images for their properties
CREATE POLICY "Users can insert images for own properties"
ON property_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties
    WHERE id = property_id AND owner_id = auth.uid()
  )
);

-- Property owners can update images for their properties
CREATE POLICY "Users can update images for own properties"
ON property_images FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE id = property_id AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties
    WHERE id = property_id AND owner_id = auth.uid()
  )
);

-- Property owners can delete images for their properties
CREATE POLICY "Users can delete images for own properties"
ON property_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE id = property_id AND owner_id = auth.uid()
  )
);

-- Admins can do everything on property images
CREATE POLICY "Admins can manage all property images"
ON property_images FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- SAVED_PROPERTIES TABLE POLICIES
-- ============================================

-- Users can read their own saved properties
CREATE POLICY "Users can read own saved properties"
ON saved_properties FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own saved properties
CREATE POLICY "Users can insert own saved properties"
ON saved_properties FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved properties
CREATE POLICY "Users can delete own saved properties"
ON saved_properties FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all saved properties
CREATE POLICY "Admins can read all saved properties"
ON saved_properties FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================
-- VIEWING_REQUESTS TABLE POLICIES
-- ============================================

-- Tenants can read their own viewing requests
CREATE POLICY "Tenants can read own viewing requests"
ON viewing_requests FOR SELECT
TO authenticated
USING (auth.uid() = tenant_id);

-- Landlords can read viewing requests for their properties
CREATE POLICY "Landlords can read requests for their properties"
ON viewing_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE id = property_id AND owner_id = auth.uid()
  )
  OR auth.uid() = landlord_id
);

-- Tenants can insert their own viewing requests
CREATE POLICY "Tenants can insert own viewing requests"
ON viewing_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = tenant_id);

-- Tenants can update their own viewing requests (for confirmations)
CREATE POLICY "Tenants can update own viewing requests"
ON viewing_requests FOR UPDATE
TO authenticated
USING (auth.uid() = tenant_id)
WITH CHECK (auth.uid() = tenant_id);

-- Landlords can update viewing requests for their properties
CREATE POLICY "Landlords can update requests for their properties"
ON viewing_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE id = property_id AND owner_id = auth.uid()
  )
  OR auth.uid() = landlord_id
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties
    WHERE id = property_id AND owner_id = auth.uid()
  )
  OR auth.uid() = landlord_id
);

-- Admins can do everything on viewing requests
CREATE POLICY "Admins can manage all viewing requests"
ON viewing_requests FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- TRANSACTIONS TABLE POLICIES
-- ============================================

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
ON transactions FOR SELECT
TO authenticated
USING (auth.uid() = tenant_id);

-- Admins can read all transactions
CREATE POLICY "Admins can read all transactions"
ON transactions FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- System can insert transactions (via Edge Functions or service role)
-- Note: Regular users shouldn't insert directly, but we allow authenticated users
-- for MVP. In production, use Edge Functions with service role.
CREATE POLICY "Authenticated users can insert transactions"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = tenant_id);

-- Only admins can update transactions (for payment status updates)
CREATE POLICY "Admins can update transactions"
ON transactions FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- PAYOUTS TABLE POLICIES
-- ============================================

-- Landlords can read their own payouts
CREATE POLICY "Landlords can read own payouts"
ON payouts FOR SELECT
TO authenticated
USING (auth.uid() = landlord_id);

-- Admins can read all payouts
CREATE POLICY "Admins can read all payouts"
ON payouts FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- System can insert payouts (via Edge Functions or service role)
CREATE POLICY "System can insert payouts"
ON payouts FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only admins can update payouts (for status updates)
CREATE POLICY "Admins can update payouts"
ON payouts FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- REPORTS TABLE POLICIES
-- ============================================

-- Users can create reports
CREATE POLICY "Users can create reports"
ON reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- Users can read their own reports
CREATE POLICY "Users can read own reports"
ON reports FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

-- Admins can read all reports
CREATE POLICY "Admins can read all reports"
ON reports FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Only admins can update reports (for status changes, admin notes)
CREATE POLICY "Admins can update reports"
ON reports FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- NOTES FOR AUTH CONFIGURATION
-- ============================================
-- The following settings need to be configured in Supabase Dashboard:
-- 1. Go to Authentication → Settings
-- 2. Enable email provider
-- 3. Set Site URL: http://localhost:5173
-- 4. Add Redirect URL: http://localhost:5173/**
-- 5. Email confirmations: Optional for MVP (can disable for faster testing)

