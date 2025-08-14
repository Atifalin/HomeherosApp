-- Add HomeherosGo support to profiles table
-- This migration extends the existing profiles table to support HomeherosGo onboarding

-- Add new columns to profiles table for HomeherosGo functionality
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('regular', 'homehero', 'contractor')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'approved', 'rejected', 'suspended')),
ADD COLUMN IF NOT EXISTS application_data JSONB,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create a table for user roles and permissions
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'homehero', 'contractor', 'customer')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role)
);

-- Create index for user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);

-- Set up Row Level Security for user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
-- Users can view their own roles
CREATE POLICY "Users can view own roles" 
  ON user_roles FOR SELECT 
  USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles" 
  ON user_roles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin' 
      AND ur.is_active = true
    )
  );

-- Admins can insert/update/delete roles
CREATE POLICY "Admins can manage roles" 
  ON user_roles FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin' 
      AND ur.is_active = true
    )
  );

-- Update existing profiles policies to handle HomeherosGo users
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new comprehensive policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin' 
      AND ur.is_active = true
    )
  );

-- Users can update their own profile (but not status or approval fields)
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update profiles" 
  ON profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin' 
      AND ur.is_active = true
    )
  );

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = $1 
    AND user_roles.role = $2 
    AND user_roles.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role
  FROM user_roles ur
  WHERE ur.user_id = $1 AND ur.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to approve HomeherosGo applications
CREATE OR REPLACE FUNCTION public.approve_homeheros_go_application(
  application_user_id UUID,
  approver_role TEXT DEFAULT 'homehero'
)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT public.has_role(auth.uid(), 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can approve applications';
  END IF;
  
  -- Update profile status
  UPDATE profiles 
  SET 
    status = 'approved',
    approved_at = NOW(),
    approved_by = auth.uid()
  WHERE id = application_user_id AND status = 'pending';
  
  -- Add appropriate role
  INSERT INTO user_roles (user_id, role, granted_by)
  VALUES (application_user_id, approver_role, auth.uid())
  ON CONFLICT (user_id, role) 
  DO UPDATE SET is_active = true, granted_by = auth.uid(), granted_at = NOW();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reject HomeherosGo applications
CREATE OR REPLACE FUNCTION public.reject_homeheros_go_application(
  application_user_id UUID,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT public.has_role(auth.uid(), 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can reject applications';
  END IF;
  
  -- Update profile status
  UPDATE profiles 
  SET 
    status = 'rejected',
    approved_at = NOW(),
    approved_by = auth.uid(),
    application_data = COALESCE(application_data, '{}'::jsonb) || 
                      jsonb_build_object('rejection_reason', rejection_reason)
  WHERE id = application_user_id AND status = 'pending';
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to support HomeherosGo
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, status, user_type)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'status', 'active'),
    COALESCE(new.raw_user_meta_data->>'user_type', 'regular')
  );
  
  -- Add default customer role for regular users
  IF COALESCE(new.raw_user_meta_data->>'user_type', 'regular') = 'regular' THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (new.id, 'customer');
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for pending applications (admins only)
CREATE OR REPLACE VIEW pending_applications AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.phone,
  p.address,
  p.user_type,
  p.application_data,
  p.created_at,
  au.email as auth_email
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;

-- Set up RLS for the view
ALTER VIEW pending_applications SET (security_barrier = true);

-- Grant permissions
GRANT SELECT ON pending_applications TO authenticated;

-- Note: Views inherit security from their underlying tables
-- The pending_applications view will be secured by the profiles table RLS policies

-- Create some initial admin users (you'll need to update these UUIDs with actual user IDs)
-- This is commented out - you should run this manually with actual user IDs
/*
-- Example: Make a user an admin (replace with actual user UUID)
-- INSERT INTO user_roles (user_id, role, granted_by) 
-- VALUES ('your-admin-user-uuid-here', 'admin', 'your-admin-user-uuid-here');
*/

-- Add helpful comments
COMMENT ON TABLE profiles IS 'Extended user profiles supporting HomeherosGo onboarding';
COMMENT ON TABLE user_roles IS 'User roles and permissions system';
COMMENT ON COLUMN profiles.user_type IS 'Type of user: regular, homehero, or contractor';
COMMENT ON COLUMN profiles.status IS 'Application status: active, pending, approved, rejected, suspended';
COMMENT ON COLUMN profiles.application_data IS 'JSON data from HomeherosGo onboarding forms';
COMMENT ON FUNCTION public.approve_homeheros_go_application IS 'Approve a pending HomeherosGo application (admin only)';
COMMENT ON FUNCTION public.reject_homeheros_go_application IS 'Reject a pending HomeherosGo application (admin only)';
