-- Fix infinite recursion in RLS policies
-- This migration removes and recreates policies to eliminate circular dependencies

-- Drop ALL existing policies that might cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;

-- Recreate profiles policies without circular dependencies
-- Users can view their own profile (simple, no role checking)
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile (simple, no role checking)
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (simple, no role checking)
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Recreate user_roles policies without circular dependencies
-- Users can view their own roles only
CREATE POLICY "Users can view own roles" 
  ON user_roles FOR SELECT 
  USING (auth.uid() = user_id);

-- Only allow inserts through functions (no direct INSERT policy)
-- This prevents users from granting themselves roles

-- Create a simple admin check function that doesn't use RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct query without RLS to avoid recursion
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = is_admin.user_id 
    AND role = 'admin' 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the has_role function to use direct queries
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct query without RLS to avoid recursion
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = has_role.user_id 
    AND role = role_name 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON FUNCTION public.is_admin IS 'Check if user is admin - uses direct query to avoid RLS recursion';
COMMENT ON FUNCTION public.has_role IS 'Check if user has specific role - uses direct query to avoid RLS recursion';
