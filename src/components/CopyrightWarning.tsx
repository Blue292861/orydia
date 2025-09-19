import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

export const CopyrightWarning: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-wood-800/95 backdrop-blur-sm border border-gold-500/30 rounded-lg p-3 shadow-luxury">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          <Shield className="h-4 w-4 text-gold-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="h-3 w-3 text-gold-400" />
            <span className="text-xs font-semibold text-gold-100">Propriété Intellectuelle</span>
          </div>
          <p className="text-xs text-forest-100 leading-relaxed">
            Ce contenu est protégé par les droits d'auteur. Toute reproduction, distribution ou utilisation non autorisée est strictement interdite.
          </p>
        </div>
      </div>
    </div>
  );
};