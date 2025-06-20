/*
  # Fix profiles table RLS policies

  1. Security Updates
    - Drop existing problematic RLS policies
    - Create correct RLS policies that use auth.uid() instead of uid()
    - Ensure users can create, read, and update their own profiles
  
  2. Policy Details
    - INSERT: Allow authenticated users to create profiles where user_id matches auth.uid()
    - SELECT: Allow authenticated users to read profiles where user_id matches auth.uid()
    - UPDATE: Allow authenticated users to update profiles where user_id matches auth.uid()
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create correct RLS policies using auth.uid()
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);