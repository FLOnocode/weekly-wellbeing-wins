/*
  # Create daily_challenges table for tracking daily challenge completion

  1. New Tables
    - `daily_challenges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `challenge_id` (text, identifier for the challenge)
      - `date` (date, the date when challenge was completed)
      - `is_completed` (boolean, completion status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `daily_challenges` table
    - Add policies for users to manage their own challenge data

  3. Performance
    - Add indexes for efficient querying
    - Unique constraint to prevent duplicate entries per user/challenge/date

  4. Changes
    - Clean creation with proper error handling
    - Optimized indexes for daily challenge queries
*/

-- Drop table if it exists to ensure clean creation
DROP TABLE IF EXISTS daily_challenges CASCADE;

-- Create the daily_challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  is_completed boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one entry per user per challenge per day
  CONSTRAINT daily_challenges_user_id_challenge_id_date_key UNIQUE(user_id, challenge_id, date)
);

-- Enable Row Level Security
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own daily challenges" ON daily_challenges;
  DROP POLICY IF EXISTS "Users can insert own daily challenges" ON daily_challenges;
  DROP POLICY IF EXISTS "Users can update own daily challenges" ON daily_challenges;
  DROP POLICY IF EXISTS "Users can delete own daily challenges" ON daily_challenges;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies
CREATE POLICY "Users can read own daily challenges"
  ON daily_challenges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily challenges"
  ON daily_challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily challenges"
  ON daily_challenges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily challenges"
  ON daily_challenges
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance (with IF NOT EXISTS protection)
DO $$ 
BEGIN
  -- Index for user and date queries
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'daily_challenges' 
    AND indexname = 'daily_challenges_user_date_idx'
  ) THEN
    CREATE INDEX daily_challenges_user_date_idx 
      ON daily_challenges(user_id, date DESC);
  END IF;

  -- Index for user, challenge, and date queries
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'daily_challenges' 
    AND indexname = 'daily_challenges_user_challenge_date_idx'
  ) THEN
    CREATE INDEX daily_challenges_user_challenge_date_idx 
      ON daily_challenges(user_id, challenge_id, date DESC);
  END IF;
END $$;

-- Create trigger for updating updated_at timestamp
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_daily_challenges_updated_at ON daily_challenges;
  
  CREATE TRIGGER update_daily_challenges_updated_at
    BEFORE UPDATE ON daily_challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;