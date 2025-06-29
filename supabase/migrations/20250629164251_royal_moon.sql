/*
  # Challenge Rules System

  1. New Tables
    - `challenge_rules`
      - `id` (uuid, primary key)
      - `rule_type` (text, type of rule)
      - `points` (integer, points awarded/deducted)
      - `description` (text, human readable description)
      - `details` (text, additional details)
      - `is_active` (boolean, whether rule is active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `challenge_rules` table
    - Add policy for authenticated users to read active rules

  3. Data
    - Insert challenge rules with new scoring system
    - All daily challenges worth 10 points
    - Perfect day bonus: 10 points
    - Weight loss: 15 points per kg
    - Weight gain: -15 points per kg
    - Missed weigh-in: -30 points
    - Burner of week bonus: 25 points
*/

CREATE TABLE IF NOT EXISTS challenge_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type text NOT NULL,
  points integer NOT NULL,
  description text NOT NULL,
  details text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE challenge_rules ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists and recreate it
DROP POLICY IF EXISTS "Authenticated users can read challenge rules" ON challenge_rules;

-- Policy: All authenticated users can read active rules
CREATE POLICY "Authenticated users can read challenge rules"
  ON challenge_rules
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create trigger for updating updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_challenge_rules_updated_at'
    AND event_object_table = 'challenge_rules'
  ) THEN
    CREATE TRIGGER update_challenge_rules_updated_at
      BEFORE UPDATE ON challenge_rules
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert updated challenge rules with new scoring system (only if not exists)
INSERT INTO challenge_rules (rule_type, points, description, details) 
SELECT * FROM (VALUES
  ('challenge_completion', 10, 'Défi quotidien complété', 'Points accordés pour chaque défi quotidien réalisé (10 000 pas, 1,5L d''eau, etc.)'),
  ('daily_perfect_bonus', 10, 'Journée parfaite (100% des défis)', 'Bonus accordé quand tous les défis du jour sont complétés'),
  ('weight_loss_per_kg', 15, 'Perte de poids (par kg)', 'Points accordés pour chaque kilogramme perdu lors des pesées hebdomadaires'),
  ('weight_gain_per_kg', -15, 'Prise de poids (par kg)', 'Points déduits pour chaque kilogramme pris lors des pesées hebdomadaires'),
  ('no_weight_change', 0, 'Poids stable', 'Aucun point accordé ou déduit si le poids reste identique'),
  ('missed_weigh_in', -30, 'Pesée manquée le lundi', 'Points déduits lorsque la pesée hebdomadaire du lundi n''est pas effectuée'),
  ('burner_of_week_bonus', 25, 'Brûleur de la semaine', 'Bonus accordé au participant ayant perdu le plus de poids dans la semaine')
) AS new_rules(rule_type, points, description, details)
WHERE NOT EXISTS (
  SELECT 1 FROM challenge_rules WHERE challenge_rules.rule_type = new_rules.rule_type
);