-- Fix the user creation trigger to work with HomeherosGo schema
-- This migration updates the handle_new_user function to properly handle the new columns

-- Update the function to handle new user creation with HomeherosGo columns
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with default values for new columns
  INSERT INTO public.profiles (
    id, 
    user_type, 
    status,
    email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    'regular',  -- Default user type
    'active',   -- Default status for regular users
    NEW.email,  -- Get email from auth.users
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger already exists, so we don't need to recreate it
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comment
COMMENT ON FUNCTION public.handle_new_user IS 'Updated to handle HomeherosGo schema - creates profile with default values for regular users';
