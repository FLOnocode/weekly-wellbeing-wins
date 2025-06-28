import { supabase, challengeService } from '@/lib/supabase';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  totalScore: number;
  weeklyScore: number;
  weightLost: number;
  rank: number;
  isBurnerOfWeek?: boolean;
  isCurrentUser?: boolean;
  challengesCompleted: number;
  perfectDays: number;
}

export interface ChallengeRule {
  id: string;
  rule_type: string;
  points: number;
  description: string;
  details?: string;
  is_active: boolean;
}

export const leaderboardService = {
  // Récupérer les règles du challenge
  async getChallengeRules(): Promise<ChallengeRule[]> {
    const { data, error } = await supabase
      .from('challenge_rules')
      .select('*')
      .eq('is_active', true)
      .order('rule_type');

    if (error) {
      console.error('Erreur lors de la récupération des règles:', error);
      return [];
    }

    return data || [];
  },

  // Calculer les points pour un utilisateur
  async calculateUserPoints(userId: string, startDate?: string, endDate?: string): Promise<{
    totalPoints: number;
    weeklyPoints: number;
    challengesCompleted: number;
    weightLost: number;
    perfectDays: number;
  }> {
    try {
      const rules = await this.getChallengeRules();
      const rulesMap = rules.reduce((acc, rule) => {
        acc[rule.rule_type] = rule.points;
        return acc;
      }, {} as Record<string, number>);

      let totalPoints = 0;
      let weeklyPoints = 0;
      let challengesCompleted = 0;
      let weightLost = 0;
      let perfectDays = 0;

      // Calculer les points des défis quotidiens
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const challengeStartDate = startDate || thirtyDaysAgo.toISOString().split('T')[0];
      const challengeEndDate = endDate || today.toISOString().split('T')[0];

      // Récupérer tous les défis complétés
      const { data: challenges, error: challengeError } = await supabase
        .from('daily_challenges')
        .select('challenge_id, date, is_completed')
        .eq('user_id', userId)
        .gte('date', challengeStartDate)
        .lte('date', challengeEndDate)
        .eq('is_completed', true);

      if (!challengeError && challenges) {
        challengesCompleted = challenges.length;

        // Grouper les défis par date pour calculer les journées parfaites
        const challengesByDate = this.groupChallengesByDate(challenges);
        const totalAvailableChallenges = 7; // Nombre total de défis par jour

        // Calculer les points des défis et les journées parfaites
        Object.entries(challengesByDate).forEach(([date, dateChallenges]) => {
          const challengeDate = new Date(date);
          const isThisWeek = challengeDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

          // Points pour les défis complétés (tous valent le même nombre de points maintenant)
          const challengePoints = dateChallenges.length * (rulesMap['challenge_completion'] || 10);
          totalPoints += challengePoints;
          
          if (isThisWeek) {
            weeklyPoints += challengePoints;
          }

          // Bonus pour journée parfaite (100% des défis complétés)
          if (dateChallenges.length >= totalAvailableChallenges) {
            perfectDays++;
            const perfectDayBonus = rulesMap['daily_perfect_bonus'] || 10;
            totalPoints += perfectDayBonus;
            
            if (isThisWeek) {
              weeklyPoints += perfectDayBonus;
            }
          }
        });
      }

      // Calculer les points de perte de poids
      const { data: weightEntries, error: weightError } = await supabase
        .from('weight_entries')
        .select('weight, created_at')
        .eq('user_id', userId)
        .gte('created_at', challengeStartDate)
        .order('created_at', { ascending: true });

      if (!weightError && weightEntries && weightEntries.length > 1) {
        const firstWeight = weightEntries[0].weight;
        const lastWeight = weightEntries[weightEntries.length - 1].weight;
        const weightDifference = firstWeight - lastWeight;

        if (weightDifference > 0) {
          // Perte de poids
          weightLost = weightDifference;
          const weightLossPoints = Math.round(weightDifference * (rulesMap['weight_loss_per_kg'] || 15));
          totalPoints += weightLossPoints;
        } else if (weightDifference < 0) {
          // Prise de poids (pénalité)
          const weightGainPoints = Math.round(Math.abs(weightDifference) * (rulesMap['weight_gain_per_kg'] || -15));
          totalPoints += weightGainPoints; // Déjà négatif
        }

        // Calculer les points de la semaine pour le poids
        const thisWeekEntries = weightEntries.filter(entry => {
          const entryDate = new Date(entry.created_at);
          return entryDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        });

        if (thisWeekEntries.length >= 2) {
          const weekFirstWeight = thisWeekEntries[0].weight;
          const weekLastWeight = thisWeekEntries[thisWeekEntries.length - 1].weight;
          const weekWeightDifference = weekFirstWeight - weekLastWeight;

          if (weekWeightDifference > 0) {
            weeklyPoints += Math.round(weekWeightDifference * (rulesMap['weight_loss_per_kg'] || 15));
          } else if (weekWeightDifference < 0) {
            weeklyPoints += Math.round(Math.abs(weekWeightDifference) * (rulesMap['weight_gain_per_kg'] || -15));
          }
        }
      }

      // Vérifier les pesées manquées (simplification: on vérifie juste s'il y a eu une pesée cette semaine)
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay() + 1); // Lundi de cette semaine
      
      const { data: thisWeekWeighIn, error: weighInError } = await supabase
        .from('weight_entries')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', thisWeekStart.toISOString())
        .limit(1);

      if (!weighInError && (!thisWeekWeighIn || thisWeekWeighIn.length === 0)) {
        // Pesée manquée cette semaine (seulement si on est après lundi)
        const dayOfWeek = today.getDay();
        if (dayOfWeek > 1 || (dayOfWeek === 1 && today.getHours() > 12)) { // Après lundi midi
          const missedWeighInPenalty = rulesMap['missed_weigh_in'] || -30;
          totalPoints += missedWeighInPenalty;
          weeklyPoints += missedWeighInPenalty;
        }
      }

      return {
        totalPoints: Math.max(0, totalPoints), // Minimum 0 points
        weeklyPoints,
        challengesCompleted,
        weightLost: Math.max(0, weightLost),
        perfectDays
      };

    } catch (error) {
      console.error('Erreur lors du calcul des points:', error);
      return {
        totalPoints: 0,
        weeklyPoints: 0,
        challengesCompleted: 0,
        weightLost: 0,
        perfectDays: 0
      };
    }
  },

  // Grouper les défis par date
  groupChallengesByDate(challenges: any[]): Record<string, any[]> {
    return challenges.reduce((acc, challenge) => {
      const date = challenge.date;
      
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(challenge);
      
      return acc;
    }, {} as Record<string, any[]>);
  },

  // Récupérer le classement complet
  async getLeaderboard(currentUserId?: string): Promise<LeaderboardEntry[]> {
    try {
      // Récupérer tous les profils actifs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, nickname, current_weight, goal_weight, created_at')
        .order('created_at');

      if (profilesError || !profiles) {
        console.error('Erreur lors de la récupération des profils:', profilesError);
        return [];
      }

      // Calculer les points pour chaque utilisateur
      const leaderboardPromises = profiles.map(async (profile) => {
        const stats = await this.calculateUserPoints(profile.user_id);
        
        return {
          id: profile.user_id,
          name: profile.nickname,
          totalScore: stats.totalPoints,
          weeklyScore: stats.weeklyPoints,
          weightLost: stats.weightLost,
          rank: 0, // Sera calculé après le tri
          challengesCompleted: stats.challengesCompleted,
          perfectDays: stats.perfectDays,
          isCurrentUser: profile.user_id === currentUserId
        };
      });

      const leaderboardData = await Promise.all(leaderboardPromises);

      // Trier par score total décroissant
      leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

      // Assigner les rangs
      leaderboardData.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Déterminer le brûleur de la semaine (plus de poids perdu cette semaine)
      const burnerOfWeek = leaderboardData.reduce((max, current) => 
        current.weightLost > max.weightLost ? current : max
      );
      
      if (burnerOfWeek.weightLost > 0) {
        burnerOfWeek.isBurnerOfWeek = true;
      }

      return leaderboardData;

    } catch (error) {
      console.error('Erreur lors de la récupération du classement:', error);
      return [];
    }
  }
};