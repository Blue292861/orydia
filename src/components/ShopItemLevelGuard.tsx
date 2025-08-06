import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ShopItemLevelGuardProps {
  requiredLevel: number;
  userLevel: number;
  children: React.ReactNode;
}

export const ShopItemLevelGuard: React.FC<ShopItemLevelGuardProps> = ({
  requiredLevel,
  userLevel,
  children
}) => {
  const isLocked = userLevel < requiredLevel;

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Contenu grisé */}
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      
      {/* Overlay de verrouillage */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-2 p-4">
        <div className="flex items-center gap-2">
          <Lock className="h-6 w-6 text-muted-foreground" />
          <Shield className="h-6 w-6 text-muted-foreground" />
        </div>
        
        <div className="text-center space-y-1">
          <p className="font-semibold text-foreground">Article Verrouillé</p>
          <p className="text-sm text-muted-foreground">
            Niveau {requiredLevel} requis
          </p>
          <Badge variant="outline" className="mt-2">
            Votre niveau: {userLevel}
          </Badge>
        </div>
      </div>
    </div>
  );
};