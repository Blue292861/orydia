// src/components/epub/EpubReadingControls.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Type, 
  Sun, 
  Moon, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Palette
} from 'lucide-react';
import { useContrast } from '@/contexts/ContrastContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ColorblindMode, EpubTheme } from '@/types/EpubSettings';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EpubReadingControlsProps {
  fontSize: number;
  theme: EpubTheme;
  colorblindMode: ColorblindMode;
  onFontSizeChange: (size: number) => void;
  onThemeChange: (theme: EpubTheme) => void;
  onColorblindModeChange: (mode: ColorblindMode) => void;
}

export const EpubReadingControls: React.FC<EpubReadingControlsProps> = ({
  fontSize,
  theme,
  colorblindMode,
  onFontSizeChange,
  onThemeChange,
  onColorblindModeChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { isHighContrast, toggleContrast } = useContrast();
  const isMobile = useIsMobile();

  const increaseFontSize = () => {
    if (fontSize < 24) onFontSizeChange(fontSize + 1);
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) onFontSizeChange(fontSize - 1);
  };

  const ControlsContent = () => (
    <div className="space-y-4">
      {/* Taille de texte */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Type className="h-4 w-4" />
          Taille du texte
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={decreaseFontSize}
            disabled={fontSize <= 12}
            className="flex-1"
          >
            A-
          </Button>
          <span className="text-sm font-medium w-12 text-center">{fontSize}px</span>
          <Button
            variant="outline"
            size="sm"
            onClick={increaseFontSize}
            disabled={fontSize >= 24}
            className="flex-1"
          >
            A+
          </Button>
        </div>
      </div>

      <Separator />

      {/* Thème */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Thème
        </label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onThemeChange('light')}
            className="flex items-center gap-1"
          >
            <Sun className="h-4 w-4" />
            Clair
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onThemeChange('dark')}
            className="flex items-center gap-1"
          >
            <Moon className="h-4 w-4" />
            Sombre
          </Button>
          <Button
            variant={theme === 'sepia' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onThemeChange('sepia')}
            className="flex items-center gap-1"
          >
            <Type className="h-4 w-4" />
            Sépia
          </Button>
        </div>
      </div>

      <Separator />

      {/* Contraste */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Contraste élevé
        </label>
        <Button
          variant={isHighContrast ? 'default' : 'outline'}
          size="sm"
          onClick={toggleContrast}
          className="w-full"
        >
          {isHighContrast ? 'Activé' : 'Désactivé'}
        </Button>
      </div>

      <Separator />

      {/* Mode daltonien */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Mode daltonien
        </label>
        <Select value={colorblindMode} onValueChange={(value) => onColorblindModeChange(value as ColorblindMode)}>
          <SelectTrigger>
            <SelectValue placeholder="Aucun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun</SelectItem>
            <SelectItem value="deuteranopia">Deutéranopie</SelectItem>
            <SelectItem value="protanopia">Protanopie</SelectItem>
            <SelectItem value="tritanopia">Tritanopie</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Version mobile : Sheet drawer
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full shadow-lg backdrop-blur-sm bg-card/80 border-2"
          >
            <Type className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[80vh]">
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-4">Paramètres de lecture</h3>
            <ControlsContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Version desktop : Panneau flottant
  return (
    <Card
      className={`fixed top-20 right-4 z-50 shadow-lg backdrop-blur-sm bg-card/95 border-2 transition-all duration-300 ${
        isExpanded ? 'w-72 p-4' : 'w-12 h-12 p-0'
      }`}
    >
      {isExpanded ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Paramètres</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
          <ControlsContent />
        </>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(true)}
          className="h-full w-full"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}
    </Card>
  );
};
