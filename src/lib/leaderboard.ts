import { supabase, challengeService } from '@/lib/supabase';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  totalScore: number;
  weeklyScore: number;
  weightLost: number;
  weeklyWeightChange: number;
  initialWeight: number;
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

// Utility functions for date handling
const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

const getPreviousMonday = (date: Date): Date => {
  const monday = getMonday(date);
  return new Date(monday.getTime() - 7 * 24 * 60 * 60 * 1000);
};

const findClosestWeightEntry = async (userId: string, targetDate: Date): Promise<{ weight: number; created_at: string } | null> => {
  try {
    const targetDateStr = targetDate.toISOString();
    
    // Find the closest weight entry on or before the target date
    const { data, error } = await supabase
      .from('weight_entries')
      .select('weight, created_at')
      .eq('user_id', userId)
      .lte('created_at', targetDateStr)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error finding closest weight entry:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Exception in findClosestWeightEntry:', error);
    return null;
  }
};

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
    totalWeightLost: number;
    weeklyWeightChange: number;
    initialWeight: number;
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
      let totalWeightLost = 0;
      let weeklyWeightChange = 0;
      let initialWeight = 0;
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

      // Calculer les points de poids - NOUVELLE LOGIQUE AVEC POIDS INITIAL
      const { data: weightEntries, error: weightError } = await supabase
        .from('weight_entries')
        .select('weight, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!weightError && weightEntries && weightEntries.length > 0) {
        // Récupérer le poids initial (première entrée)
        initialWeight = weightEntries[0].weight;
        
        // Calcul du poids total perdu/pris (première entrée vs dernière entrée)
        const firstWeight = weightEntries[0].weight;
        const lastWeight = weightEntries[weightEntries.length - 1].weight;
        const totalWeightDifference = firstWeight - lastWeight;

        // CORRECTION: Stocker la différence réelle (positive = perte, négative = prise)
        totalWeightLost = totalWeightDifference;

        if (totalWeightDifference > 0) {
          // Perte de poids totale
          const totalWeightLossPoints = Math.round(totalWeightDifference * (rulesMap['weight_loss_per_kg'] || 15));
          totalPoints += totalWeightLossPoints;
        } else if (totalWeightDifference < 0) {
          // Prise de poids totale (pénalité)
          const totalWeightGainPoints = Math.round(Math.abs(totalWeightDifference) * (rulesMap['weight_gain_per_kg'] || -15));
          totalPoints += totalWeightGainPoints; // Déjà négatif
        }

        // Calcul du changement de poids hebdomadaire
        const currentMonday = getMonday(today);
        const previousMonday = getPreviousMonday(today);

        // Trouver les poids les plus proches des lundis
        const currentWeekWeight = await findClosestWeightEntry(userId, currentMonday);
        const previousWeekWeight = await findClosestWeightEntry(userId, previousMonday);

        if (currentWeekWeight && previousWeekWeight) {
          const weeklyWeightDifference = previousWeekWeight.weight - currentWeekWeight.weight;
          weeklyWeightChange = weeklyWeightDifference;

          if (weeklyWeightDifference > 0) {
            // Perte de poids cette semaine
            const weeklyWeightLossPoints = Math.round(weeklyWeightDifference * (rulesMap['weight_loss_per_kg'] || 15));
            weeklyPoints += weeklyWeightLossPoints;
          } else if (weeklyWeightDifference < 0) {
            // Prise de poids cette semaine (pénalité)
            const weeklyWeightGainPoints = Math.round(Math.abs(weeklyWeightDifference) * (rulesMap['weight_gain_per_kg'] || -15));
            weeklyPoints += weeklyWeightGainPoints; // Déjà négatif
          }
        }
      }

      // Vérifier les pesées manquées - LOGIQUE AMÉLIORÉE
      const currentMonday = getMonday(today);
      const isAfterMonday = today.getDay() > 1 || (today.getDay() === 1 && today.getHours() > 12);

      if (isAfterMonday) {
        // Vérifier s'il y a une pesée pour le lundi de cette semaine
        const mondayWeighIn = await findClosestWeightEntry(userId, new Date(currentMonday.getTime() + 24 * 60 * 60 * 1000)); // Jusqu'à mardi

        if (!mondayWeighIn || new Date(mondayWeighIn.created_at) < currentMonday) {
          // Pesée manquée cette semaine
          const missedWeighInPenalty = rulesMap['missed_weigh_in'] || -30;
          totalPoints += missedWeighInPenalty;
          weeklyPoints += missedWeighInPenalty;
        }
      }

      return {
        totalPoints: Math.max(0, totalPoints), // Minimum 0 points
        weeklyPoints,
        challengesCompleted,
        totalWeightLost, // CORRECTION: Retourner la vraie différence (peut être négative)
        weeklyWeightChange,
        initialWeight,
        perfectDays
      };

    } catch (error) {
      console.error('Erreur lors du calcul des points:', error);
      return {
        totalPoints: 0,
        weeklyPoints: 0,
        challengesCompleted: 0,
        totalWeightLost: 0,
        weeklyWeightChange: 0,
        initialWeight: 0,
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

  // Récupérer le classement complet - TOUS les profils maintenant
  async getLeaderboard(currentUserId?: string): Promise<LeaderboardEntry[]> {
    try {
      console.log('🔍 Récupération de TOUS les profils pour le classement...');
      
      // Récupérer TOUS les profils, même ceux sans données complètes
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, nickname, current_weight, goal_weight, created_at')
        .order('created_at');

      if (profilesError) {
        console.error('❌ Erreur lors de la récupération des profils:', profilesError);
        return [];
      }

      if (!profiles || profiles.length === 0) {
        console.log('📋 Aucun profil trouvé dans la base de données');
        return [];
      }

      console.log(`✅ ${profiles.length} profil(s) trouvé(s) pour le classement:`, 
        profiles.map(p => ({ 
          nickname: p.nickname || 'Non défini', 
          current_weight: p.current_weight || 0, 
          goal_weight: p.goal_weight || 0,
          user_id: p.user_id.substring(0, 8) + '...'
        }))
      );

      // Calculer les points pour chaque utilisateur
      const leaderboardPromises = profiles.map(async (profile) => {
        // Créer un nom d'affichage avec fallback
        let displayName = 'Utilisateur';
        
        if (profile.nickname && profile.nickname.trim() !== '') {
          displayName = profile.nickname;
        } else {
          // Utiliser les 4 premiers caractères de l'ID utilisateur comme identifiant unique
          const userIdShort = profile.user_id.substring(0, 8);
          displayName = `Utilisateur ${userIdShort}`;
        }

        console.log(`📊 Calcul des points pour ${displayName}...`);
        const stats = await this.calculateUserPoints(profile.user_id);
        
        return {
          id: profile.user_id,
          name: displayName,
          totalScore: stats.totalPoints,
          weeklyScore: stats.weeklyPoints,
          weightLost: stats.totalWeightLost,
          weeklyWeightChange: stats.weeklyWeightChange,
          initialWeight: stats.initialWeight,
          rank: 0, // Sera calculé après le tri
          challengesCompleted: stats.challengesCompleted,
          perfectDays: stats.perfectDays,
          isCurrentUser: profile.user_id === currentUserId
        };
      });

      const leaderboardData = await Promise.all(leaderboardPromises);

      console.log('📈 Données du classement avant tri:', 
        leaderboardData.map(entry => ({ 
          name: entry.name, 
          totalScore: entry.totalScore, 
          weeklyScore: entry.weeklyScore,
          weightLost: entry.weightLost,
          weeklyWeightChange: entry.weeklyWeightChange,
          initialWeight: entry.initialWeight
        }))
      );

      // Trier par score total décroissant
      leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

      // Assigner les rangs
      leaderboardData.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Déterminer le brûleur de la semaine (plus de poids perdu CETTE SEMAINE)
      if (leaderboardData.length > 0) {
        const burnerOfWeek = leaderboardData.reduce((max, current) => 
          current.weeklyWeightChange > max.weeklyWeightChange ? current : max
        );
        
        if (burnerOfWeek.weeklyWeightChange > 0) {
          burnerOfWeek.isBurnerOfWeek = true;
          console.log(`🔥 Brûleur de la semaine: ${burnerOfWeek.name} avec ${burnerOfWeek.weeklyWeightChange.toFixed(1)}kg perdus cette semaine`);
        }
      }

      console.log('🏆 Classement final:', 
        leaderboardData.map(entry => ({ 
          rank: entry.rank,
          name: entry.name, 
          totalScore: entry.totalScore,
          weeklyWeightChange: entry.weeklyWeightChange,
          initialWeight: entry.initialWeight,
          isBurnerOfWeek: entry.isBurnerOfWeek || false
        }))
      );

      return leaderboardData;

    } catch (error) {
      console.error('💥 Erreur lors de la récupération du classement:', error);
      return [];
    }
  }
};