/*
  # Add No Weight Change Rule

  1. Changes
    - Add new rule for weight stability (0 points when weight doesn't change)
    - Use INSERT with conditional check instead of ON CONFLICT

  2. Rule Details
    - Rule type: 'no_weight_change'
    - Points: 0 (neutral - no bonus, no penalty)
    - Description: Weight stability between weekly weigh-ins
*/

-- Insert the no weight change rule if it doesn't exist
INSERT INTO challenge_rules (rule_type, points, description, details, is_active)
SELECT 
  'no_weight_change',
  0,
  'Stabilité du poids',
  'Aucun changement de poids entre deux pesées hebdomadaires.',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM challenge_rules WHERE rule_type = 'no_weight_change'
);

-- Update existing rule if it exists
UPDATE challenge_rules 
SET 
  points = 0,
  description = 'Stabilité du poids',
  details = 'Aucun changement de poids entre deux pesées hebdomadaires.',
  is_active = true,
  updated_at = now()
WHERE rule_type = 'no_weight_change';