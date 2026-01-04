import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Type, Sun, Moon, Eye, Palette } from 'lucide-react';
import { useContrast } from '@/contexts/ContrastContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Theme = 'light' | 'dark' | 'sepia';
type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

interface ChapterReadingControlsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fontSize: number;
  theme: Theme;
  colorblindMode: ColorblindMode;
  onFontSizeChange: (size: number) => void;
  onThemeChange: (theme: Theme) => void;
  onColorblindModeChange: (mode: ColorblindMode) => void;
}

export const ChapterReadingControls: React.FC<ChapterReadingControlsProps> = ({
  open,
  onOpenChange,
  fontSize,
  theme,
  colorblindMode,
  onFontSizeChange,
  onThemeChange,
  onColorblindModeChange,
}) => {
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
      {/* Font Size */}
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

      {/* Theme */}
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
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onThemeChange('dark')}
          >
            <Moon className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === 'sepia' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onThemeChange('sepia')}
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Contrast */}
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

      {/* Colorblind Mode */}
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

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] z-[2147483646]">
          <SheetHeader>
            <SheetTitle>Paramètres de lecture</SheetTitle>
            <SheetDescription className="sr-only">Ajustez la taille du texte, le thème et l'accessibilité.</SheetDescription>
          </SheetHeader>
          <div className="py-2">
            <ControlsContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md z-[2147483646]">
        <DialogHeader>
          <DialogTitle>Paramètres de lecture</DialogTitle>
        </DialogHeader>
        <ControlsContent />
      </DialogContent>
    </Dialog>
  );
};
