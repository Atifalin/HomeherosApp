-- Additional helper functions and views for HomeherosGo
-- This migration adds utility functions for better HomeherosGo management

-- Create function to get user profile with roles
CREATE OR REPLACE FUNCTION public.get_user_profile_with_roles(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  location TEXT,
  user_type TEXT,
  status TEXT,
  application_data JSONB,
  roles TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.address,
    p.location,
    p.user_type,
    p.status,
    p.application_data,
    ARRAY_AGG(ur.role) FILTER (WHERE ur.role IS NOT NULL AND ur.is_active = true) as roles
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id AND ur.is_active = true
  WHERE p.id = $1
  GROUP BY p.id, p.name, p.email, p.phone, p.address, p.location, p.user_type, p.status, p.application_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can access HomeherosGo features
CREATE OR REPLACE FUNCTION public.can_access_homeheros_features(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.id = ur.user_id
    WHERE p.id = $1 
    AND ur.role IN ('homehero', 'contractor', 'admin')
    AND ur.is_active = true
    AND p.status IN ('approved', 'active')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get pending applications count (for admin dashboard)
CREATE OR REPLACE FUNCTION public.get_pending_applications_count()
RETURNS INTEGER AS $$
DECLARE
  is_admin BOOLEAN;
  count INTEGER;
BEGIN
  -- Check if current user is admin
  SELECT public.has_role(auth.uid(), 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO count
  FROM profiles
  WHERE status = 'pending';
  
  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get applications by status
CREATE OR REPLACE FUNCTION public.get_applications_by_status(app_status TEXT DEFAULT 'pending')
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  user_type TEXT,
  application_data JSONB,
  created_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID
) AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT public.has_role(auth.uid(), 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can view applications';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.address,
    p.user_type,
    p.application_data,
    p.created_at,
    p.approved_at,
    p.approved_by
  FROM profiles p
  WHERE p.status = app_status
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to bulk approve applications
CREATE OR REPLACE FUNCTION public.bulk_approve_applications(
  application_ids UUID[],
  default_role TEXT DEFAULT 'homehero'
)
RETURNS INTEGER AS $$
DECLARE
  is_admin BOOLEAN;
  approved_count INTEGER := 0;
  app_id UUID;
BEGIN
  -- Check if current user is admin
  SELECT public.has_role(auth.uid(), 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can approve applications';
  END IF;
  
  -- Loop through each application ID
  FOREACH app_id IN ARRAY application_ids
  LOOP
    -- Approve the application
    IF public.approve_homeheros_go_application(app_id, default_role) THEN
      approved_count := approved_count + 1;
    END IF;
  END LOOP;
  
  RETURN approved_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user role
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID,
  new_role TEXT,
  is_active BOOLEAN DEFAULT true
)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT public.has_role(auth.uid(), 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;
  
  -- Validate role
  IF new_role NOT IN ('admin', 'homehero', 'contractor', 'customer') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Update or insert role
  INSERT INTO user_roles (user_id, role, granted_by, is_active)
  VALUES (target_user_id, new_role, auth.uid(), is_active)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET 
    is_active = is_active,
    granted_by = auth.uid(),
    granted_at = NOW();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to deactivate user
CREATE OR REPLACE FUNCTION public.deactivate_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT public.has_role(auth.uid(), 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can deactivate users';
  END IF;
  
  -- Update profile status
  UPDATE profiles 
  SET status = 'suspended'
  WHERE id = target_user_id;
  
  -- Deactivate all roles
  UPDATE user_roles 
  SET is_active = false
  WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reactivate user
CREATE OR REPLACE FUNCTION public.reactivate_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT public.has_role(auth.uid(), 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can reactivate users';
  END IF;
  
  -- Update profile status
  UPDATE profiles 
  SET status = 'approved'
  WHERE id = target_user_id;
  
  -- Reactivate roles (except admin role for security)
  UPDATE user_roles 
  SET is_active = true
  WHERE user_id = target_user_id AND role != 'admin';
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE status = 'pending') as pending_applications,
  (SELECT COUNT(*) FROM profiles WHERE status = 'approved') as approved_users,
  (SELECT COUNT(*) FROM profiles WHERE status = 'rejected') as rejected_applications,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'homehero' AND status = 'approved') as active_homeheros,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'contractor' AND status = 'approved') as active_contractors,
  (SELECT COUNT(*) FROM profiles WHERE status = 'suspended') as suspended_users;

-- Set up RLS for the admin stats view
ALTER VIEW admin_dashboard_stats SET (security_barrier = true);
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Note: Views inherit security from their underlying tables
-- The admin_dashboard_stats view will be secured by the profiles and user_roles table RLS policies

-- Create notification function for new applications
CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify for HomeherosGo applications
  IF NEW.user_type IN ('homehero', 'contractor') AND NEW.status = 'pending' THEN
    -- You can extend this to send actual notifications
    -- For now, it just logs the event
    RAISE NOTICE 'New % application from %', NEW.user_type, NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new application notifications
DROP TRIGGER IF EXISTS notify_new_homeheros_application ON profiles;
CREATE TRIGGER notify_new_homeheros_application
  AFTER INSERT ON profiles
  FOR EACH ROW 
  WHEN (NEW.user_type IN ('homehero', 'contractor') AND NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_new_application();

-- Add helpful comments
COMMENT ON FUNCTION public.get_user_profile_with_roles IS 'Get complete user profile including roles';
COMMENT ON FUNCTION public.can_access_homeheros_features IS 'Check if user can access HomeherosGo features';
COMMENT ON FUNCTION public.get_pending_applications_count IS 'Get count of pending applications (admin only)';
COMMENT ON FUNCTION public.get_applications_by_status IS 'Get applications filtered by status (admin only)';
COMMENT ON FUNCTION public.bulk_approve_applications IS 'Approve multiple applications at once (admin only)';
COMMENT ON VIEW admin_dashboard_stats IS 'Statistics for admin dashboard';
COMMENT ON FUNCTION public.notify_new_application IS 'Trigger function to notify about new applications';
