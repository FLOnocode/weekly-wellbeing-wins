/*
  # Create user preferences table

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `theme` (text, default 'dark')
      - `push_notifications` (boolean, default false)
      - `email_notifications` (boolean, default true)
      - `challenge_reminders` (boolean, default true)
      - `weekly_reports` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_preferences` table
    - Add policies for authenticated users to manage their own preferences

  3. Indexes
    - Add index on user_id for faster lookups
*/

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'dark',
  push_notifications boolean NOT NULL DEFAULT false,
  email_notifications boolean NOT NULL DEFAULT true,
  challenge_reminders boolean NOT NULL DEFAULT true,
  weekly_reports boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_preferences_user_id_key UNIQUE (user_id)
);

-- Create trigger to update updated_at column (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_preferences_updated_at' 
    AND tgrelid = 'user_preferences'::regclass
  ) THEN
    CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies (with IF NOT EXISTS equivalent)
DO $$
BEGIN
  -- Policy for SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_preferences' 
    AND policyname = 'Users can read their own preferences'
  ) THEN
    CREATE POLICY "Users can read their own preferences"
      ON user_preferences
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Policy for INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_preferences' 
    AND policyname = 'Users can insert their own preferences'
  ) THEN
    CREATE POLICY "Users can insert their own preferences"
      ON user_preferences
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_preferences' 
    AND policyname = 'Users can update their own preferences'
  ) THEN
    CREATE POLICY "Users can update their own preferences"
      ON user_preferences
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create index for faster lookups (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'user_preferences' 
    AND indexname = 'user_preferences_user_id_idx'
  ) THEN
    CREATE INDEX user_preferences_user_id_idx ON user_preferences (user_id);
  END IF;
END $$;