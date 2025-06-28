/*
  # Création de la table feedback

  1. Nouvelle table
    - `feedback`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, clé étrangère vers auth.users)
      - `message` (text, contenu du feedback)
      - `created_at` (timestamp, date de création)

  2. Sécurité
    - Activer RLS sur la table `feedback`
    - Politique pour permettre aux utilisateurs authentifiés d'insérer leurs propres feedbacks
    - Politique pour permettre aux utilisateurs authentifiés de lire leurs propres feedbacks
*/

-- Créer la table feedback
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'insérer leurs propres feedbacks
CREATE POLICY "Users can insert own feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de lire leurs propres feedbacks
CREATE POLICY "Users can read own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS feedback_user_id_created_at_idx 
  ON feedback (user_id, created_at DESC);