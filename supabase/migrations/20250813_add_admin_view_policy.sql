-- Add admin policy to view all profiles for dashboard functionality
-- This uses the safe is_admin() function that doesn't cause RLS recursion

-- Add admin policy for viewing all profiles
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (public.is_admin());

-- Add admin policy for updating all profiles (for approval/rejection)
CREATE POLICY "Admins can update all profiles" 
  ON profiles FOR UPDATE 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Refresh the policy cache
NOTIFY pgrst, 'reload schema';
