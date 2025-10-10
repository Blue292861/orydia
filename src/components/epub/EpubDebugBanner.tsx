import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EpubDebugBannerProps {
  spineLength: number;
  currentIndex: number;
  currentHref: string;
  preloadStatus: string;
  averageLatency: number;
  lastError: string | null;
  isFullLoadMode: boolean;
  isSafeCssMode: boolean;
  onToggleSafeCss: () => void;
  onClose: () => void;
}

export const EpubDebugBanner = ({
  spineLength,
  currentIndex,
  currentHref,
  preloadStatus,
  averageLatency,
  lastError,
  isFullLoadMode,
  isSafeCssMode,
  onToggleSafeCss,
  onClose,
}: EpubDebugBannerProps) => {
  return (
    <Card className="fixed top-4 right-4 z-50 p-4 bg-background/95 backdrop-blur border-2 border-primary max-w-md">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-sm">EPUB Debug Info</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-xs space-y-1 font-mono">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Spine Length:</span>
          <span className="font-semibold">{spineLength}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current Index:</span>
          <span className="font-semibold">{currentIndex} / {spineLength - 1}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Progress:</span>
          <span className="font-semibold">
            {spineLength > 0 ? Math.round((currentIndex / spineLength) * 100) : 0}%
          </span>
        </div>
        
        <div className="mt-2 pt-2 border-t">
          <div className="text-muted-foreground mb-1">Current Section:</div>
          <div className="break-all text-[10px] bg-muted p-1 rounded">
            {currentHref || 'N/A'}
          </div>
        </div>
        
        <div className="flex justify-between mt-2 pt-2 border-t">
          <span className="text-muted-foreground">Preload Status:</span>
          <span className="font-semibold">{preloadStatus}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Avg Latency:</span>
          <span className="font-semibold">{averageLatency.toFixed(0)}ms</span>
        </div>
        
        <div className="mt-2 pt-2 border-t">
          <div className="flex justify-between items-center mb-1">
            <span className="text-muted-foreground">Load Mode:</span>
            <span className={`font-semibold ${isFullLoadMode ? 'text-green-500' : ''}`}>
              {isFullLoadMode ? 'Full ArrayBuffer' : 'Stream/Range'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">CSS Mode:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSafeCss}
              className="h-6 text-xs"
            >
              {isSafeCssMode ? 'Safe (no optimizations)' : 'Optimized'}
            </Button>
          </div>
        </div>
        
        {lastError && (
          <div className="mt-2 pt-2 border-t border-destructive/20">
            <div className="text-destructive mb-1">Last Error:</div>
            <div className="break-all text-[10px] bg-destructive/10 p-1 rounded text-destructive">
              {lastError}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
