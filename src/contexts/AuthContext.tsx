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
    
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 AuthContext: Session récupérée:', session ? 'Utilisateur connecté' : 'Pas de session')
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('👤 AuthContext: Utilisateur trouvé, récupération du profil...')
        fetchProfile(session.user.id)
      } else {
        console.log('❌ AuthContext: Pas d\'utilisateur, arrêt du chargement')
        setLoading(false)
      }
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthContext: Changement d\'état d\'auth:', event, session ? 'Session présente' : 'Pas de session')
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

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    console.log('🔍 AuthContext: Début de fetchProfile pour userId:', userId)
    console.log('⏳ AuthContext: État loading avant fetchProfile:', loading)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      console.log('📊 AuthContext: Réponse de la requête profil:', { data, error })

      if (error && error.code !== 'PGRST116') {
        console.error('❌ AuthContext: Erreur lors de la récupération du profil:', error)
      } else {
        console.log('✅ AuthContext: Profil récupéré avec succès:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('💥 AuthContext: Exception lors de fetchProfile:', error)
    } finally {
      console.log('🏁 AuthContext: Fin de fetchProfile, setLoading(false)')
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    console.log('📝 AuthContext: Tentative d\'inscription pour:', email)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    console.log('📝 AuthContext: Résultat inscription:', error ? 'Erreur' : 'Succès')
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AuthContext: Tentative de connexion pour:', email)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log('🔐 AuthContext: Résultat connexion:', error ? 'Erreur' : 'Succès')
    return { error }
  }

  const signOut = async () => {
    console.log('🚪 AuthContext: Déconnexion')
    await supabase.auth.signOut()
  }

  const updateProfile = async (profileData: Partial<Profile>) => {
    console.log('💾 AuthContext: Début updateProfile avec données:', profileData)
    
    if (!user) {
      console.log('❌ AuthContext: Pas d\'utilisateur connecté pour updateProfile')
      return { error: new Error('No user logged in') }
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    console.log('💾 AuthContext: Résultat updateProfile:', { data, error })

    if (!error && data) {
      console.log('✅ AuthContext: Mise à jour du profil local avec:', data)
      // Mettre à jour immédiatement l'état local avec les données retournées
      setProfile(data)
      // SUPPRESSION: Plus besoin de refetch, les données sont déjà à jour
    }

    return { error }
  }

  const refreshProfile = async () => {
    console.log('🔄 AuthContext: Rafraîchissement du profil demandé')
    if (user) {
      await fetchProfile(user.id)
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