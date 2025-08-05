import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { UITheme } from '@/types/Theme';
import { Palette, Wand2, RotateCcw } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const {
    currentTheme,
    userThemePreference,
    allThemes,
    setTheme,
    setAutoThemeEnabled,
    setAdminOverride,
    isLoading
  } = useTheme();

  if (isLoading) {
    return <div>Chargement des thèmes...</div>;
  }

  const handleThemeSelect = async (themeKey: UITheme) => {
    await setTheme(themeKey);
  };

  const handleAutoToggle = async (enabled: boolean) => {
    await setAutoThemeEnabled(enabled);
  };

  const handleAdminOverride = async (themeKey: UITheme | null) => {
    await setAdminOverride(themeKey);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Sélecteur de thème
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Theme Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-theme" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Thème automatique basé sur les lectures
          </Label>
          <Switch
            id="auto-theme"
            checked={userThemePreference?.auto_theme_enabled || false}
            onCheckedChange={handleAutoToggle}
          />
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allThemes.map((theme) => (
            <Button
              key={theme.theme_key}
              variant={currentTheme?.theme_key === theme.theme_key ? 'default' : 'outline'}
              className="h-20 flex flex-col gap-2 p-3"
              onClick={() => handleThemeSelect(theme.theme_key)}
            >
              <div
                className="w-8 h-8 rounded-full border-2"
                style={{ backgroundColor: theme.primary_color }}
              />
              <span className="text-xs font-medium">{theme.name}</span>
            </Button>
          ))}
        </div>

        {/* Admin Override Section */}
        {userThemePreference?.admin_override_theme && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">
                Override administrateur actif
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAdminOverride(null)}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </div>
        )}

        {/* Current Theme Info */}
        {currentTheme && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Thème actuel</h4>
            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{currentTheme.name}</p>
              {currentTheme.description && (
                <p className="text-sm text-muted-foreground">{currentTheme.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Police: {currentTheme.font_family}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};