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
    console.log('🔍 Récupération du profil pour:', userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('📋 Résultat profil:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erreur récupération profil:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Profil trouvé:', data);
        setProfile(data);
      } else {
        console.log('📝 Aucun profil trouvé, création d\'un profil vide...');
        // Créer un profil vide pour déclencher l'onboarding
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            nickname: '',
            goal_weight: 0,
            current_weight: 0,
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erreur création profil vide:', createError);
          // Même si la création échoue, on met un profil null pour déclencher l'onboarding
          setProfile(null);
        } else {
          console.log('✅ Profil vide créé:', newProfile);
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('💥 Exception fetchProfile:', error);
      setProfile(null);
    }
  };

  // Premier useEffect : Gestion de l'état d'authentification uniquement
  useEffect(() => {
    console.log('🔄 AuthContext: Initialisation de l\'authentification...');
    
    const initAuth = async () => {
      try {
        // Récupérer la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📱 Session actuelle:', { session: !!session, error });

        if (session?.user) {
          console.log('👤 Utilisateur connecté trouvé:', session.user.id);
          setUser(session.user);
          setSession(session);
        } else {
          console.log('👤 Pas d\'utilisateur connecté');
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('💥 Erreur initialisation auth:', err);
        setUser(null);
        setSession(null);
        setProfile(null);
      } finally {
        console.log('✅ Initialisation auth terminée');
        setLoading(false);
      }
    };

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, !!session);
        
        if (session?.user) {
          console.log('👤 Utilisateur connecté via auth change:', session.user.id);
          setUser(session.user);
          setSession(session);
        } else {
          console.log('👤 Utilisateur déconnecté via auth change');
          setUser(null);
          setSession(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Deuxième useEffect : Gestion du profil uniquement quand un utilisateur est connecté
  useEffect(() => {
    if (!user) {
      console.log('⏹ Aucun utilisateur connecté, profil non chargé.');
      setProfile(null);
      return;
    }

    console.log('🔍 Chargement du profil pour utilisateur connecté:', user.id);
    setLoading(true);
    
    fetchProfile(user.id)
      .finally(() => {
        console.log('✅ Chargement du profil terminé');
        setLoading(false);
      });
  }, [user]);

  const signUp = async (email: string, password: string) => {
    console.log('📝 Inscription pour:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      console.log('📝 Résultat inscription:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
        hasError: !!error,
        errorMessage: error?.message
      });
      
      if (error) {
        console.error('❌ Erreur inscription:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('💥 Exception signUp:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Connexion pour:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('🔐 Résultat connexion:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
        hasError: !!error,
        errorMessage: error?.message
      });
      
      if (error) {
        console.error('❌ Erreur connexion:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('💥 Exception signIn:', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('🚪 Déconnexion');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erreur déconnexion:', error);
      } else {
        console.log('✅ Déconnexion réussie');
      }
    } catch (error) {
      console.error('💥 Exception signOut:', error);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    console.log('💾 Mise à jour profil:', profileData);
    
    if (!user) {
      console.log('❌ Pas d\'utilisateur connecté');
      return { error: new Error('No user logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      console.log('💾 Résultat updateProfile:', {
        hasData: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message
      });

      if (error) {
        console.error('❌ Erreur updateProfile:', error);
      } else if (data) {
        console.log('✅ Profil mis à jour:', data);
        setProfile(data);
      }

      return { error };
    } catch (error) {
      console.error('💥 Exception updateProfile:', error);
      return { error };
    }
  };

  const refreshProfile = async () => {
    console.log('🔄 Rafraîchissement profil');
    
    if (!user) {
      console.log('⏹ Aucun utilisateur connecté, pas de rafraîchissement du profil');
      return;
    }

    setLoading(true);
    try {
      await fetchProfile(user.id);
    } finally {
      setLoading(false);
    }
  };

  console.log('🎯 État AuthContext:', { 
    loading, 
    user: !!user, 
    profile: !!profile,
    userId: user?.id || 'none'
  });

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};