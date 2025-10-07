// src/types/EpubSettings.ts
export type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
export type EpubTheme = 'light' | 'dark' | 'sepia';

export interface EpubSettings {
  fontSize: number;
  theme: EpubTheme;
  colorblindMode: ColorblindMode;
}

export const DEFAULT_EPUB_SETTINGS: EpubSettings = {
  fontSize: 16,
  theme: 'light',
  colorblindMode: 'none',
};
