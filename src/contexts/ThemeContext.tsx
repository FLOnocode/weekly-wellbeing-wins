import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from './AuthContext';
import { preferencesService } from '@/lib/supabase';

interface ThemeContextType {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  saveThemePreference: (theme: string) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Charger les préférences de thème depuis la base de données
  useEffect(() => {
    const loadThemePreference = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const preferences = await preferencesService.getUserPreferences(user.id);
        
        if (preferences?.theme) {
          setTheme(preferences.theme);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des préférences de thème:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThemePreference();
  }, [user, setTheme]);

  // Sauvegarder les préférences de thème dans la base de données
  const saveThemePreference = async (newTheme: string) => {
    if (!user) return;

    try {
      await preferencesService.updateUserPreferences(user.id, {
        theme: newTheme
      });
      
      console.log('✅ Préférence de thème sauvegardée:', newTheme);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences de thème:', error);
    }
  };

  const value = {
    theme,
    setTheme,
    saveThemePreference,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};