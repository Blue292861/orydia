
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Minus, Plus, Type } from 'lucide-react';

interface TextSizeControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export const TextSizeControls: React.FC<TextSizeControlsProps> = ({
  fontSize,
  onFontSizeChange,
}) => {
  const handleSliderChange = (value: number[]) => {
    onFontSizeChange(value[0]);
  };

  const decreaseSize = () => {
    if (fontSize > 12) {
      onFontSizeChange(fontSize - 1);
    }
  };

  const increaseSize = () => {
    if (fontSize < 24) {
      onFontSizeChange(fontSize + 1);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
      <Type className="h-4 w-4 text-muted-foreground" />
      <Button
        variant="outline"
        size="icon"
        onClick={decreaseSize}
        disabled={fontSize <= 12}
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="flex-1 px-2">
        <Slider
          value={[fontSize]}
          onValueChange={handleSliderChange}
          min={12}
          max={24}
          step={1}
          className="w-full"
        />
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={increaseSize}
        disabled={fontSize >= 24}
      >
        <Plus className="h-4 w-4" />
      </Button>
      
      <span className="text-sm font-medium min-w-[3ch]">{fontSize}px</span>
    </div>
  );
};
