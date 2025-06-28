/*
  # Add no weight change rule

  1. Changes
    - Insert or update the 'no_weight_change' rule in challenge_rules table
    - Uses a safe upsert pattern that works without unique constraints

  2. Security
    - No RLS changes needed as challenge_rules already has proper policies
*/

-- Delete existing rule if it exists, then insert the new one
DELETE FROM challenge_rules WHERE rule_type = 'no_weight_change';

INSERT INTO challenge_rules (rule_type, points, description, details, is_active)
VALUES (
  'no_weight_change',
  0,
  'Stabilité du poids',
  'Aucun changement de poids entre deux pesées hebdomadaires.',
  true
);