/*
  # Allow all authenticated users to read all profiles for leaderboard

  1. Security Changes
    - Drop the restrictive policy that only allows users to read their own profile
    - Create a new policy that allows all authenticated users to read all profiles
    - This enables the leaderboard functionality to display all participants

  2. Privacy Considerations
    - Only basic profile information (nickname, weights, dates) is exposed
    - No sensitive personal data is included in the profiles table
    - Users are still restricted to only modify their own profiles
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create new policy allowing all authenticated users to read all profiles
CREATE POLICY "Allow authenticated users to read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Note: Keep existing policies for INSERT and UPDATE unchanged
-- Users can still only create and modify their own profiles