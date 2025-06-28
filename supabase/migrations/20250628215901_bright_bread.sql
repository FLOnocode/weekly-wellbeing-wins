/*
  # Ajouter la règle de stabilité du poids

  1. Nouvelle règle
    - `no_weight_change` : 0 points pour aucun changement de poids entre deux pesées
  
  2. Sécurité
    - Vérification d'existence avant insertion pour éviter les doublons
*/

-- Insérer la nouvelle règle seulement si elle n'existe pas déjà
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