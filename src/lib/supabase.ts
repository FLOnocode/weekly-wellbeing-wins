import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.warn('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn('Error writing to localStorage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Error removing from localStorage:', error);
        }
      },
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
});

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED' && !session) {
    console.warn('Token refresh failed, clearing local storage');
    // Clear any stale auth data
    try {
      localStorage.removeItem(`sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`);
    } catch (error) {
      console.warn('Error clearing auth token:', error);
    }
  }
});

// Challenge service for managing daily challenges
export const challengeService = {
  // Get completed challenges for a specific date
  async getCompletedChallenges(userId: string, date: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('challenge_id')
        .eq('user_id', userId)
        .eq('date', date)
        .eq('is_completed', true);

      if (error) {
        console.error('Error fetching completed challenges:', error);
        return [];
      }

      return data?.map(item => item.challenge_id) || [];
    } catch (error) {
      console.error('Exception in getCompletedChallenges:', error);
      return [];
    }
  },

  // Toggle a challenge completion status
  async toggleChallenge(userId: string, challengeId: string, date: string, isCompleted: boolean): Promise<boolean> {
    try {
      if (isCompleted) {
        // Insert or update the challenge as completed
        const { error } = await supabase
          .from('daily_challenges')
          .upsert({
            user_id: userId,
            challenge_id: challengeId,
            date: date,
            is_completed: true
          }, {
            onConflict: 'user_id,challenge_id,date'
          });

        if (error) {
          console.error('Error completing challenge:', error);
          return false;
        }
      } else {
        // Delete the challenge record
        const { error } = await supabase
          .from('daily_challenges')
          .delete()
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .eq('date', date);

        if (error) {
          console.error('Error removing challenge:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Exception in toggleChallenge:', error);
      return false;
    }
  },

  // Get daily challenge count for a date range with optional filtering
  async getFilteredDailyChallengeCount(
    userId: string, 
    startDate: string, 
    endDate: string, 
    challengeIds?: string[]
  ): Promise<Record<string, number>> {
    try {
      let query = supabase
        .from('daily_challenges')
        .select('date, challenge_id')
        .eq('user_id', userId)
        .eq('is_completed', true)
        .gte('date', startDate)
        .lte('date', endDate);

      if (challengeIds && challengeIds.length > 0) {
        query = query.in('challenge_id', challengeIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching filtered challenge count:', error);
        return {};
      }

      // Group by date and count challenges
      const countByDate: Record<string, number> = {};
      data?.forEach(item => {
        countByDate[item.date] = (countByDate[item.date] || 0) + 1;
      });

      return countByDate;
    } catch (error) {
      console.error('Exception in getFilteredDailyChallengeCount:', error);
      return {};
    }
  },

  // Get detailed challenge statistics
  async getChallengeStatsDetailed(
    userId: string, 
    startDate: string, 
    endDate: string, 
    challengeIds?: string[]
  ): Promise<Array<{ challenge_id: string; date: string; is_completed: boolean }>> {
    try {
      let query = supabase
        .from('daily_challenges')
        .select('challenge_id, date, is_completed')
        .eq('user_id', userId)
        .eq('is_completed', true)
        .gte('date', startDate)
        .lte('date', endDate);

      if (challengeIds && challengeIds.length > 0) {
        query = query.in('challenge_id', challengeIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching detailed challenge stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception in getChallengeStatsDetailed:', error);
      return [];
    }
  }
};