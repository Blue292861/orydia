import React from 'react';
import { ContactDialog } from './ContactDialog';
import { Instagram } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

export const ProfileFooter: React.FC = () => {
  const { isMobile } = useResponsive();

  return (
    <div className={cn(
      "bg-gradient-to-br from-amber-900/40 to-orange-950/60 border-2 border-amber-700/50 rounded-lg shadow-xl backdrop-blur-sm",
      isMobile ? "p-4" : "p-6"
    )}>
      {/* Titre du footer */}
      <div className="text-center mb-4">
        <h3 className="text-amber-400 font-bold text-lg">Rejoignez la communauté Orydia</h3>
      </div>

      <div className={cn(
        "flex gap-4",
        isMobile ? "flex-col items-center" : "flex-row justify-center items-center"
      )}>
        {/* Contact Button */}
        <ContactDialog />

        {/* Instagram Link */}
        <a
          href="https://www.instagram.com/la_toison_d_or_sarl?igsh=N2NjcGV1bWVuMTAy"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-md border-2 border-amber-600/40 bg-amber-900/30",
            "hover:bg-amber-800/50 transition-all duration-200",
            "hover:scale-105 hover:shadow-lg hover:border-amber-500"
          )}
          aria-label="Nous retrouver sur Instagram"
        >
          <Instagram className="w-5 h-5 text-pink-500" />
          <span className="text-sm font-medium text-amber-100">Instagram</span>
        </a>

        {/* TikTok Link */}
        <a
          href="https://www.tiktok.com/@sarl_toison_d_or?_r=1&_t=ZN-91YG3bQyqE2"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-md border-2 border-amber-600/40 bg-amber-900/30",
            "hover:bg-amber-800/50 transition-all duration-200",
            "hover:scale-105 hover:shadow-lg hover:border-amber-500"
          )}
          aria-label="Nous retrouver sur TikTok"
        >
          <svg
            className="w-5 h-5 text-amber-100"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
          <span className="text-sm font-medium text-amber-100">TikTok</span>
        </a>
      </div>
    </div>
  );
};
