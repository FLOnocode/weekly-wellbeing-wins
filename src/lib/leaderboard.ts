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
  perfectWeeks: number;
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
    perfectWeeks: number;
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
      let perfectWeeks = 0;

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

        // Calculer les points des défis
        challenges.forEach(challenge => {
          const challengeDate = new Date(challenge.date);
          const isThisWeek = challengeDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

          let points = 0;
          // Défis difficiles valent plus de points
          if (challenge.challenge_id === 'no-sugar') {
            points = rulesMap['challenge_completion_difficult'] || 20;
          } else {
            points = rulesMap['challenge_completion'] || 10;
          }

          totalPoints += points;
          if (isThisWeek) {
            weeklyPoints += points;
          }
        });

        // Calculer les semaines parfaites
        const challengesByWeek = this.groupChallengesByWeek(challenges);
        perfectWeeks = Object.values(challengesByWeek).filter(weekChallenges => 
          weekChallenges.length >= 7 // Tous les défis de la semaine
        ).length;

        // Bonus pour semaines parfaites
        const perfectWeekBonus = (rulesMap['perfect_week_bonus'] || 10) * perfectWeeks;
        totalPoints += perfectWeekBonus;
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
          // Prise de poids
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
        // Pesée manquée cette semaine
        const missedWeighInPenalty = rulesMap['missed_weigh_in'] || -30;
        totalPoints += missedWeighInPenalty;
        weeklyPoints += missedWeighInPenalty;
      }

      return {
        totalPoints: Math.max(0, totalPoints), // Minimum 0 points
        weeklyPoints,
        challengesCompleted,
        weightLost: Math.max(0, weightLost),
        perfectWeeks
      };

    } catch (error) {
      console.error('Erreur lors du calcul des points:', error);
      return {
        totalPoints: 0,
        weeklyPoints: 0,
        challengesCompleted: 0,
        weightLost: 0,
        perfectWeeks: 0
      };
    }
  },

  // Grouper les défis par semaine
  groupChallengesByWeek(challenges: any[]): Record<string, any[]> {
    return challenges.reduce((acc, challenge) => {
      const date = new Date(challenge.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1); // Lundi de la semaine
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!acc[weekKey]) {
        acc[weekKey] = [];
      }
      acc[weekKey].push(challenge);
      
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
          perfectWeeks: stats.perfectWeeks,
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