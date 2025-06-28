/*
  # Create challenge rules and scoring system

  1. New Tables
    - `challenge_rules`
      - `id` (uuid, primary key)
      - `rule_type` (text, type of rule: 'challenge_completion', 'weight_loss', 'weight_gain', 'missed_weigh_in')
      - `points` (integer, points awarded/deducted)
      - `description` (text, description of the rule)
      - `is_active` (boolean, whether rule is active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `challenge_rules` table
    - Add policy for authenticated users to read rules
    - Add policy for admin users to manage rules (for future admin functionality)

  3. Default Rules
    - Insert default scoring rules for the challenge
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

-- Policy: All authenticated users can read rules
CREATE POLICY "Authenticated users can read challenge rules"
  ON challenge_rules
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_challenge_rules_updated_at
  BEFORE UPDATE ON challenge_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default challenge rules
INSERT INTO challenge_rules (rule_type, points, description, details) VALUES
('challenge_completion', 10, 'Défi quotidien complété', 'Points accordés pour chaque défi quotidien réalisé (10 000 pas, 1,5L d''eau, etc.)'),
('challenge_completion_difficult', 20, 'Défi difficile complété', 'Points accordés pour les défis difficiles comme "Journée sans sucre"'),
('weight_loss_per_kg', 15, 'Perte de poids (par kg)', 'Points accordés pour chaque kilogramme perdu lors des pesées hebdomadaires'),
('weight_gain_per_kg', -15, 'Prise de poids (par kg)', 'Points déduits pour chaque kilogramme pris lors des pesées hebdomadaires'),
('missed_weigh_in', -30, 'Pesée manquée', 'Points déduits lorsque la pesée hebdomadaire du lundi n''est pas effectuée'),
('perfect_week_bonus', 10, 'Semaine parfaite', 'Bonus accordé pour avoir complété tous les défis de la semaine'),
('burner_of_week_bonus', 25, 'Brûleur de la semaine', 'Bonus accordé au participant ayant perdu le plus de poids dans la semaine');