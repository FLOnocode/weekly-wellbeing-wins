import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour TypeScript
export interface Profile {
  id: string
  user_id: string
  nickname: string
  goal_weight: number
  current_weight: number
  created_at: string
  updated_at: string
}

export interface WeightEntry {
  id: string
  user_id: string
  weight: number
  photo_url?: string
  notes?: string
  created_at: string
}

export interface DailyChallenge {
  id: string
  user_id: string
  challenge_id: string
  date: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

// Fonctions utilitaires pour les défis quotidiens
export const challengeService = {
  // Récupérer les défis complétés pour une date donnée
  async getCompletedChallenges(userId: string, date: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('challenge_id')
      .eq('user_id', userId)
      .eq('date', date)
      .eq('is_completed', true);

    if (error) {
      console.error('Erreur lors de la récupération des défis:', error);
      return [];
    }

    return data?.map(item => item.challenge_id) || [];
  },

  // Marquer un défi comme complété ou non complété
  async toggleChallenge(userId: string, challengeId: string, date: string, isCompleted: boolean): Promise<boolean> {
    try {
      if (isCompleted) {
        // Insérer ou mettre à jour le défi comme complété
        const { error } = await supabase
          .from('daily_challenges')
          .upsert({
            user_id: userId,
            challenge_id: challengeId,
            date: date,
            is_completed: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,challenge_id,date'
          });

        if (error) {
          console.error('Erreur lors de la sauvegarde du défi:', error);
          return false;
        }
      } else {
        // Supprimer l'entrée du défi
        const { error } = await supabase
          .from('daily_challenges')
          .delete()
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .eq('date', date);

        if (error) {
          console.error('Erreur lors de la suppression du défi:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Exception lors de la gestion du défi:', error);
      return false;
    }
  },

  // Récupérer les statistiques des défis pour une période
  async getChallengeStats(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('challenge_id, date, is_completed')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('is_completed', true)
      .order('date', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return [];
    }

    return data || [];
  },

  // Récupérer le nombre de défis complétés par jour
  async getDailyChallengeCount(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('date')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('is_completed', true);

    if (error) {
      console.error('Erreur lors du comptage des défis:', error);
      return {};
    }

    // Grouper par date et compter
    const countByDate: { [key: string]: number } = {};
    data?.forEach(item => {
      countByDate[item.date] = (countByDate[item.date] || 0) + 1;
    });

    return countByDate;
  },

  // Nouvelle fonction : Récupérer le nombre de défis complétés par jour pour des défis spécifiques
  async getFilteredDailyChallengeCount(userId: string, startDate: string, endDate: string, challengeIds?: string[]) {
    let query = supabase
      .from('daily_challenges')
      .select('date, challenge_id')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('is_completed', true);

    // Appliquer le filtre par challenge_id si fourni
    if (challengeIds && challengeIds.length > 0) {
      query = query.in('challenge_id', challengeIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors du comptage des défis filtrés:', error);
      return {};
    }

    // Grouper par date et compter
    const countByDate: { [key: string]: number } = {};
    data?.forEach(item => {
      countByDate[item.date] = (countByDate[item.date] || 0) + 1;
    });

    return countByDate;
  },

  // Nouvelle fonction : Récupérer les statistiques détaillées par défi
  async getChallengeStatsDetailed(userId: string, startDate: string, endDate: string, challengeIds?: string[]) {
    let query = supabase
      .from('daily_challenges')
      .select('challenge_id, date, is_completed')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('is_completed', true)
      .order('date', { ascending: true });

    // Appliquer le filtre par challenge_id si fourni
    if (challengeIds && challengeIds.length > 0) {
      query = query.in('challenge_id', challengeIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des statistiques détaillées:', error);
      return [];
    }

    return data || [];
  }
};