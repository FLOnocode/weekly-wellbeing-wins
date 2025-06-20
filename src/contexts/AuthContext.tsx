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

  const fetchProfile = async (userId: string) => {
    console.log('🔍 AuthContext: Début de fetchProfile pour userId:', userId);
    
    try {
      // Use maybeSingle() instead of single() to handle cases where no profile exists
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ AuthContext: Erreur lors de la récupération du profil:', error);
        setProfile(null);
        return;
      }

      // If no profile exists, create one
      if (!profileData) {
        console.log('📝 AuthContext: Aucun profil trouvé, création d\'un nouveau profil...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            user_id: userId,
            nickname: '',
            goal_weight: 0,
            current_weight: 0
          }])
          .select()
          .single();

        if (createError) {
          console.error('❌ AuthContext: Erreur lors de la création du profil:', createError);
          setProfile(null);
        } else {
          console.log('✅ AuthContext: Nouveau profil créé:', newProfile);
          setProfile(newProfile);
        }
      } else {
        console.log('✅ AuthContext: Profil trouvé:', profileData);
        setProfile(profileData);
      }
    } catch (err) {
      console.error('💥 AuthContext: Erreur inattendue:', err);
      setProfile(null);
    } finally {
      setLoading(false);
      console.log('🏁 AuthContext: fetchProfile terminé, loading: false');
    }
  };

  // Fonction avec timeout de sécurité
  const fetchProfileWithTimeout = async (userId: string, timeout = 10000) => {
    return Promise.race([
      fetchProfile(userId),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  };

  useEffect(() => {
    console.log('🔄 AuthContext: Initialisation du useEffect principal')
    console.log('🔧 AuthContext: Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Défini' : 'MANQUANT')
    console.log('🔧 AuthContext: Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Défini' : 'MANQUANT')
    
    // Test de connectivité Supabase
    console.log('🌐 AuthContext: Test de connectivité Supabase...')
    
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('📋 AuthContext: Résultat getSession:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        error: error
      })
      
      if (error) {
        console.error('❌ AuthContext: Erreur lors de getSession:', error)
        console.error('❌ AuthContext: Code d\'erreur:', error.code)
        console.error('❌ AuthContext: Message d\'erreur:', error.message)
        setLoading(false)
        return
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('👤 AuthContext: Utilisateur trouvé, récupération du profil...')
        console.log('👤 AuthContext: User ID:', session.user.id)
        console.log('👤 AuthContext: User email:', session.user.email)
        
        // Utiliser fetchProfileWithTimeout au lieu de fetchProfile
        fetchProfileWithTimeout(session.user.id).catch((error) => {
          console.error('⏰ AuthContext: Timeout ou erreur:', error);
          setLoading(false);
          setProfile(null);
        });
      } else {
        console.log('❌ AuthContext: Pas d\'utilisateur, arrêt du chargement')
        setLoading(false)
      }
    }).catch((error) => {
      console.error('💥 AuthContext: Exception lors de getSession:', error)
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthContext: Changement d\'état d\'auth:', event)
      console.log('🔔 AuthContext: Session dans onAuthStateChange:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        event: event
      })
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('👤 AuthContext: Nouvel utilisateur, récupération du profil...')
        
        try {
          await fetchProfileWithTimeout(session.user.id);
        } catch (error) {
          console.error('⏰ AuthContext: Timeout ou erreur:', error);
          setLoading(false);
          setProfile(null);
        }
      } else {
        console.log('❌ AuthContext: Pas d\'utilisateur, nettoyage du profil')
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      console.log('🧹 AuthContext: Nettoyage de la subscription')
      subscription.unsubscribe()
    }
  }, [])

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
      try {
        await fetchProfileWithTimeout(user.id);
      } catch (error) {
        console.error('⏰ AuthContext: Timeout lors du refresh:', error);
        setLoading(false);
        setProfile(null);
      }
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