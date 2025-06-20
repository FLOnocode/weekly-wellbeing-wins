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
        fetchProfile(session.user.id)
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
        await fetchProfile(session.user.id)
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

  const fetchProfile = async (userId: string) => {
    console.log('🔍 AuthContext: Début de fetchProfile pour userId:', userId)
    console.log('⏳ AuthContext: État loading avant fetchProfile:', loading)
    
    try {
      console.log('📡 AuthContext: Tentative de requête vers la table profiles...')
      
      // Test de connectivité de base
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      console.log('🧪 AuthContext: Test de connectivité table profiles:', {
        success: !testError,
        error: testError,
        canAccessTable: !!testData
      })
      
      if (testError) {
        console.error('❌ AuthContext: Erreur de connectivité table profiles:', testError)
        console.error('❌ AuthContext: Code d\'erreur:', testError.code)
        console.error('❌ AuthContext: Message:', testError.message)
        console.error('❌ AuthContext: Détails:', testError.details)
        console.error('❌ AuthContext: Hint:', testError.hint)
      }

      // Requête principale pour le profil
      console.log('📊 AuthContext: Exécution de la requête principale...')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      console.log('📊 AuthContext: Réponse de la requête profil:', {
        hasData: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message,
        dataKeys: data ? Object.keys(data) : null
      })

      if (error) {
        console.error('❌ AuthContext: Erreur détaillée lors de la récupération du profil:')
        console.error('   - Code:', error.code)
        console.error('   - Message:', error.message)
        console.error('   - Détails:', error.details)
        console.error('   - Hint:', error.hint)
        console.error('   - User ID recherché:', userId)
        
        if (error.code === 'PGRST116') {
          console.log('ℹ️ AuthContext: Aucun profil trouvé (normal pour un nouvel utilisateur)')
        } else {
          console.error('💥 AuthContext: Erreur inattendue lors de la récupération du profil')
        }
      } else {
        console.log('✅ AuthContext: Profil récupéré avec succès:', {
          id: data?.id,
          nickname: data?.nickname,
          hasGoalWeight: !!data?.goal_weight,
          hasCurrentWeight: !!data?.current_weight
        })
        setProfile(data)
      }
    } catch (error) {
      console.error('💥 AuthContext: Exception lors de fetchProfile:', error)
      console.error('💥 AuthContext: Type d\'erreur:', typeof error)
      console.error('💥 AuthContext: Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace')
    } finally {
      console.log('🏁 AuthContext: Fin de fetchProfile, setLoading(false)')
      setLoading(false)
    }
  }

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