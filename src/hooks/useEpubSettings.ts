// src/hooks/useEpubSettings.ts
import { useState, useEffect } from 'react';
import { EpubSettings, DEFAULT_EPUB_SETTINGS, ColorblindMode, EpubTheme } from '@/types/EpubSettings';

export const useEpubSettings = (bookId?: string) => {
  const [settings, setSettings] = useState<EpubSettings>(DEFAULT_EPUB_SETTINGS);

  // Charger les paramètres depuis localStorage au montage
  useEffect(() => {
    try {
      const savedFontSize = localStorage.getItem(`epub_fontSize_${bookId}`);
      const savedTheme = localStorage.getItem(`epub_theme_${bookId}`);
      const savedColorblindMode = localStorage.getItem('epub_colorblind_mode');

      setSettings({
        fontSize: savedFontSize ? parseInt(savedFontSize) : DEFAULT_EPUB_SETTINGS.fontSize,
        theme: (savedTheme as EpubTheme) || DEFAULT_EPUB_SETTINGS.theme,
        colorblindMode: (savedColorblindMode as ColorblindMode) || DEFAULT_EPUB_SETTINGS.colorblindMode,
      });
    } catch (error) {
      console.error('Error loading EPUB settings:', error);
    }
  }, [bookId]);

  // Sauvegarder les paramètres dans localStorage
  const updateFontSize = (fontSize: number) => {
    setSettings((prev) => ({ ...prev, fontSize }));
    localStorage.setItem(`epub_fontSize_${bookId}`, fontSize.toString());
  };

  const updateTheme = (theme: EpubTheme) => {
    setSettings((prev) => ({ ...prev, theme }));
    localStorage.setItem(`epub_theme_${bookId}`, theme);
  };

  const updateColorblindMode = (mode: ColorblindMode) => {
    setSettings((prev) => ({ ...prev, colorblindMode: mode }));
    localStorage.setItem('epub_colorblind_mode', mode);
  };

  return {
    settings,
    updateFontSize,
    updateTheme,
    updateColorblindMode,
  };
};
