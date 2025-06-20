/*
  # Create weight entries table for tracking weight progress

  1. New Tables
    - `weight_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `weight` (numeric, weight in kg)
      - `photo_url` (text, optional URL to proof photo)
      - `notes` (text, optional user notes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `weight_entries` table
    - Add policy for users to read/write their own weight entries
*/

CREATE TABLE IF NOT EXISTS weight_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight numeric(5,2) NOT NULL,
  photo_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own weight entries"
  ON weight_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight entries"
  ON weight_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight entries"
  ON weight_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight entries"
  ON weight_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS weight_entries_user_id_created_at_idx 
  ON weight_entries(user_id, created_at DESC);