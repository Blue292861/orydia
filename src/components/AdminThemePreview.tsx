import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { UITheme } from '@/types/Theme';
import { Eye, RotateCcw, Palette } from 'lucide-react';
import { AdaptiveText } from './AdaptiveText';

export const AdminThemePreview: React.FC = () => {
  const { allThemes, currentTheme, setAdminOverride } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<UITheme | null>(null);

  const handlePreview = async (themeKey: UITheme) => {
    setPreviewTheme(themeKey);
    await setAdminOverride(themeKey);
  };

  const handleReset = async () => {
    setPreviewTheme(null);
    await setAdminOverride(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Aperçu des thèmes (Admin)
        </CardTitle>
        {previewTheme && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">Prévisualisation active</Badge>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allThemes.map((theme) => (
            <Card 
              key={theme.theme_key} 
              className={`transition-all ${
                currentTheme?.theme_key === theme.theme_key 
                  ? 'ring-2 ring-primary' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{theme.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(theme.theme_key)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Color Palette */}
                <div className="flex gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: theme.primary_color }}
                    title="Couleur primaire"
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: theme.accent_color }}
                    title="Couleur accent"
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: theme.secondary_color }}
                    title="Couleur secondaire"
                  />
                </div>

                {/* Font Preview */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Police: {theme.font_family}</p>
                  <p className="text-sm">
                    Aperçu du texte
                  </p>
                </div>

                {/* Vocabulary Preview */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Vocabulaire:</p>
                  <div className="space-y-1">
                    <p className="text-xs">• {theme.vocabulary.greeting}</p>
                    <p className="text-xs">• {theme.vocabulary.welcome}</p>
                    <p className="text-xs">• {theme.vocabulary.continue_reading}</p>
                  </div>
                </div>

                {/* Mock UI Preview */}
                <div 
                  className="p-3 rounded border-2"
                  style={{ 
                    backgroundColor: theme.background_color,
                    borderColor: theme.secondary_color,
                    color: theme.text_color
                  }}
                >
                  <div 
                    className="text-sm font-medium mb-2"
                    style={{ color: theme.primary_color }}
                  >
                    {theme.vocabulary.welcome}
                  </div>
                  <div className="text-xs mb-2">
                    {theme.vocabulary.greeting}, voici un aperçu de ce thème.
                  </div>
                  <div 
                    className="inline-flex items-center px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: theme.accent_color,
                      color: theme.background_color
                    }}
                  >
                    {theme.vocabulary.continue_reading}
                  </div>
                </div>

                {theme.description && (
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Theme Display */}
        {currentTheme && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Thème actuellement affiché:</h4>
            <div className="flex items-center gap-4">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: currentTheme.primary_color }}
              />
              <div>
                <p className="font-medium">{currentTheme.name}</p>
                <p className="text-sm text-muted-foreground">
                  Police: {currentTheme.font_family}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};