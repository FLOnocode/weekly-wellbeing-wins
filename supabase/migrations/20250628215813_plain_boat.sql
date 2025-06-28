/*
  # Ajouter la règle de stabilité du poids

  1. Nouvelle règle
    - Ajoute une règle pour la stabilité du poids (0 points)
    - Type: 'no_weight_change'
    - Points: 0
    - Description: 'Stabilité du poids'
    - Détails: 'Aucun changement de poids entre deux pesées hebdomadaires.'
*/

INSERT INTO challenge_rules (rule_type, points, description, details, is_active)
VALUES (
  'no_weight_change',
  0,
  'Stabilité du poids',
  'Aucun changement de poids entre deux pesées hebdomadaires.',
  true
)
ON CONFLICT (rule_type) DO UPDATE SET
  points = EXCLUDED.points,
  description = EXCLUDED.description,
  details = EXCLUDED.details,
  is_active = EXCLUDED.is_active,
  updated_at = now();