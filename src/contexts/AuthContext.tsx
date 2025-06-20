import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (profile: Partial<Profile>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fonction de test simple
  const testSupabaseConnection = async () => {
    try {
      console.log('🌐 Test de base Supabase...');
      
      // Test simple avec une requête minimale
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      console.log('📊 Résultat test:', { data, error });
      return !error;
    } catch (err) {
      console.error('💥 Erreur test connexion:', err);
      return false;
    }
  };

  const fetchProfile = async (userId: string) => {
    console.log('🔍 Début fetchProfile pour:', userId);
    
    try {
      // Test de connectivité d'abord
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        console.error('❌ Pas de connexion Supabase');
        throw new Error('Connexion Supabase échouée');
      }

      console.log('📡 Requête profile pour userId:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Utilise maybeSingle() au lieu de single()

      console.log('📋 Réponse profiles:', { data, error });

      if (error) {
        console.error('❌ Erreur requête profiles:', error);
        
        // Si la table n'existe pas ou autre erreur, créer un profil par défaut
        console.log('📝 Tentative création profil...');
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert({ 
            user_id: userId,
            nickname: '',
            goal_weight: 0,
            current_weight: 0,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Erreur création profil:', insertError);
          // Même si la création échoue, on continue avec un profil null
          setProfile(null);
        } else {
          console.log('✅ Profil créé:', newProfile);
          setProfile(newProfile);
        }
      } else {
        console.log('✅ Profil trouvé:', data);
        setProfile(data);
      }

    } catch (err) {
      console.error('💥 Erreur fetchProfile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    console.log('🔄 AuthContext: Initialisation...');
    
    // Timeout de sécurité global
    const safetyTimeout = setTimeout(() => {
      console.warn('⚠️ TIMEOUT SÉCURITÉ - Arrêt forcé du loading');
      setLoading(false);
    }, 8000); // 8 secondes max

    const initAuth = async () => {
      try {
        // Récupérer la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📱 Session actuelle:', { session: !!session, error });

        if (session?.user) {
          console.log('👤 Utilisateur connecté:', session.user.id);
          setUser(session.user);
          setSession(session);
          
          // Essayer de récupérer le profil
          await fetchProfile(session.user.id);
        } else {
          console.log('👤 Pas d\'utilisateur connecté');
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('💥 Erreur initialisation auth:', err);
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, !!session);
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    initAuth();

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('📝 AuthContext: Tentative d\'inscription pour:', email)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      console.log('📝 AuthContext: Résultat inscription:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
        hasError: !!error,
        errorMessage: error?.message
      })
      
      if (error) {
        console.error('❌ AuthContext: Erreur lors de l\'inscription:', error)
      }
      
      return { error }
    } catch (error) {
      console.error('💥 AuthContext: Exception lors de signUp:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AuthContext: Tentative de connexion pour:', email)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('🔐 AuthContext: Résultat connexion:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
        hasError: !!error,
        errorMessage: error?.message
      })
      
      if (error) {
        console.error('❌ AuthContext: Erreur lors de la connexion:', error)
      }
      
      return { error }
    } catch (error) {
      console.error('💥 AuthContext: Exception lors de signIn:', error)
      return { error }
    }
  }

  const signOut = async () => {
    console.log('🚪 AuthContext: Déconnexion')
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ AuthContext: Erreur lors de la déconnexion:', error)
      } else {
        console.log('✅ AuthContext: Déconnexion réussie')
      }
    } catch (error) {
      console.error('💥 AuthContext: Exception lors de signOut:', error)
    }
  }

  const updateProfile = async (profileData: Partial<Profile>) => {
    console.log('💾 AuthContext: Début updateProfile avec données:', profileData)
    
    if (!user) {
      console.log('❌ AuthContext: Pas d\'utilisateur connecté pour updateProfile')
      return { error: new Error('No user logged in') }
    }

    try {
      console.log('📡 AuthContext: Tentative d\'upsert du profil...')
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      console.log('💾 AuthContext: Résultat updateProfile:', {
        hasData: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message
      })

      if (error) {
        console.error('❌ AuthContext: Erreur lors de updateProfile:', error)
        console.error('   - Code:', error.code)
        console.error('   - Message:', error.message)
        console.error('   - Détails:', error.details)
      } else if (data) {
        console.log('✅ AuthContext: Mise à jour du profil local avec:', {
          id: data.id,
          nickname: data.nickname
        })
        setProfile(data)
      }

      return { error }
    } catch (error) {
      console.error('💥 AuthContext: Exception lors de updateProfile:', error)
      return { error }
    }
  }

  const refreshProfile = async () => {
    console.log('🔄 AuthContext: Rafraîchissement du profil demandé')
    if (user) {
      await fetchProfile(user.id)
    } else {
      console.log('❌ AuthContext: Pas d\'utilisateur pour refreshProfile')
    }
  }

  // Log de l'état actuel à chaque rendu
  console.log('🎯 AuthContext: État actuel - loading:', loading, 'user:', !!user, 'profile:', !!profile)

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}