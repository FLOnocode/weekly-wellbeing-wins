import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { challengeService } from "@/lib/supabase";
import { leaderboardService } from "@/lib/leaderboard";

// Hook pour récupérer les statistiques quotidiennes
export function useDailyStats() {
  const { user } = useAuth();
  const [dailyStats, setDailyStats] = useState({
    totalPoints: 0,
    completedChallenges: 0,
    totalChallenges: 7
  });
  const [loading, setLoading] = useState(true);

  // Obtenir la date du jour au format YYYY-MM-DD
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchDailyStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 1. Récupérer les défis complétés aujourd'hui
        const todayDate = getTodayDate();
        const completedChallengeIds = await challengeService.getCompletedChallenges(user.id, todayDate);
        
        // 2. Récupérer les règles de points pour calculer les points
        const rules = await leaderboardService.getChallengeRules();
        
        // 3. Trouver la règle pour les défis complétés
        const challengeCompletionRule = rules.find(rule => rule.rule_type === 'challenge_completion');
        const pointsPerChallenge = challengeCompletionRule ? challengeCompletionRule.points : 10;
        
        // 4. Calculer les points de base pour les défis complétés
        let totalPoints = completedChallengeIds.length * pointsPerChallenge;
        
        // 5. Vérifier si tous les défis sont complétés pour ajouter le bonus de journée parfaite
        const totalChallenges = 7; // Nombre total de défis par jour
        if (completedChallengeIds.length === totalChallenges) {
          const perfectDayRule = rules.find(rule => rule.rule_type === 'daily_perfect_bonus');
          if (perfectDayRule) {
            totalPoints += perfectDayRule.points;
          }
        }
        
        // 6. Mettre à jour les statistiques
        setDailyStats({
          totalPoints,
          completedChallenges: completedChallengeIds.length,
          totalChallenges
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques quotidiennes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyStats();
  }, [user]);

  return { ...dailyStats, loading };
}