import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { themeService } from '@/services/themeService';
import { ThemeConfig, UITheme, UserThemePreference } from '@/types/Theme';

interface ThemeContextType {
  currentTheme: ThemeConfig | null;
  userThemePreference: UserThemePreference | null;
  allThemes: ThemeConfig[];
  isLoading: boolean;
  setTheme: (theme: UITheme) => Promise<void>;
  setAutoThemeEnabled: (enabled: boolean) => Promise<void>;
  setAdminOverride: (theme: UITheme | null) => Promise<void>;
  refreshUserTheme: () => Promise<void>;
  getVocabulary: (key: string, fallback?: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);
  const [userThemePreference, setUserThemePreference] = useState<UserThemePreference | null>(null);
  const [allThemes, setAllThemes] = useState<ThemeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemes();
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadUserTheme();
    } else {
      // Load default theme for non-authenticated users
      loadDefaultTheme();
    }
  }, [session?.user, allThemes]);

  const loadThemes = async () => {
    try {
      const themes = await themeService.getAllThemes();
      setAllThemes(themes);
    } catch (error) {
      console.error('Error loading themes:', error);
    }
  };

  const loadDefaultTheme = () => {
    const defaultTheme = allThemes.find(t => t.theme_key === 'default');
    if (defaultTheme) {
      setCurrentTheme(defaultTheme);
      applyThemeToDOM(defaultTheme);
    }
    setIsLoading(false);
  };

  const loadUserTheme = async () => {
    if (!session?.user || allThemes.length === 0) return;

    try {
      setIsLoading(true);
      let preference = await themeService.getUserThemePreference(session.user.id);
      
      if (!preference) {
        // Get recommended theme for new users
        const recommendedTheme = await themeService.getRecommendedTheme(session.user.id);
        preference = await themeService.createUserThemePreference(session.user.id, recommendedTheme);
      }

      setUserThemePreference(preference);

      // Determine which theme to use (admin override takes precedence)
      const themeToUse = preference.admin_override_theme || preference.current_theme;
      const theme = allThemes.find(t => t.theme_key === themeToUse) || allThemes.find(t => t.theme_key === 'default');
      
      if (theme) {
        setCurrentTheme(theme);
        applyThemeToDOM(theme);
      }
    } catch (error) {
      console.error('Error loading user theme:', error);
      loadDefaultTheme();
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeToDOM = (theme: ThemeConfig) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--theme-primary', theme.primary_color);
    root.style.setProperty('--theme-secondary', theme.secondary_color);
    root.style.setProperty('--theme-accent', theme.accent_color);
    root.style.setProperty('--theme-background', theme.background_color);
    root.style.setProperty('--theme-text', theme.text_color);
    root.style.setProperty('--theme-font-family', theme.font_family);

    // Add font to head if it's a Google Font
    const fontName = theme.font_family;
    if (fontName !== 'Inter' && fontName !== 'sans-serif') {
      const existingLink = document.querySelector(`link[href*="${fontName}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@400;600;700&display=swap`;
        document.head.appendChild(link);
      }
    }

    // Update body font
    document.body.style.fontFamily = theme.font_family;
  };

  const setTheme = async (theme: UITheme) => {
    if (!session?.user) return;

    try {
      const preference = await themeService.updateUserTheme(session.user.id, theme, false);
      setUserThemePreference(preference);
      
      const themeConfig = allThemes.find(t => t.theme_key === theme);
      if (themeConfig) {
        setCurrentTheme(themeConfig);
        applyThemeToDOM(themeConfig);
      }
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  };

  const setAutoThemeEnabled = async (enabled: boolean) => {
    if (!session?.user || !userThemePreference) return;

    try {
      const preference = await themeService.updateUserTheme(
        session.user.id,
        userThemePreference.current_theme,
        enabled
      );
      setUserThemePreference(preference);

      if (enabled) {
        // Get recommended theme and apply it
        const recommendedTheme = await themeService.getRecommendedTheme(session.user.id);
        await setTheme(recommendedTheme);
      }
    } catch (error) {
      console.error('Error setting auto theme:', error);
    }
  };

  const setAdminOverride = async (theme: UITheme | null) => {
    if (!session?.user) return;

    try {
      const preference = await themeService.setAdminOverride(session.user.id, theme);
      setUserThemePreference(preference);
      
      const themeToUse = theme || preference.current_theme;
      const themeConfig = allThemes.find(t => t.theme_key === themeToUse);
      if (themeConfig) {
        setCurrentTheme(themeConfig);
        applyThemeToDOM(themeConfig);
      }
    } catch (error) {
      console.error('Error setting admin override:', error);
    }
  };

  const refreshUserTheme = async () => {
    if (session?.user) {
      await loadUserTheme();
    }
  };

  const getVocabulary = (key: string, fallback?: string): string => {
    if (currentTheme?.vocabulary[key]) {
      return currentTheme.vocabulary[key];
    }
    return fallback || key;
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        userThemePreference,
        allThemes,
        isLoading,
        setTheme,
        setAutoThemeEnabled,
        setAdminOverride,
        refreshUserTheme,
        getVocabulary,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};