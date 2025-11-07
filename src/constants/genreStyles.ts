import { LiteraryGenre } from './genres';

export interface GenreStyle {
  card: string;
  border: string;
  gradient: string;
  animation?: string;
  ornament: string;
  hoverGlow?: string;
}

export const GENRE_STYLES: Record<LiteraryGenre, GenreStyle> = {
  'Fantaisie': {
    card: 'genre-fantasy',
    border: 'border-fantasy',
    gradient: 'bg-gradient-to-br from-purple-900/80 via-purple-600/60 to-amber-500/80',
    animation: 'animate-golden-shimmer',
    ornament: '✦',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(217,119,6,0.4)]'
  },
  'Fantastique': {
    card: 'genre-fantastique',
    border: 'border-fantastique',
    gradient: 'bg-gradient-to-br from-slate-900/80 via-indigo-700/60 to-purple-600/80',
    animation: 'animate-gentle-float',
    ornament: '🌙',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(109,40,217,0.4)]'
  },
  'Science-Fiction': {
    card: 'genre-scifi',
    border: 'border-scifi',
    gradient: 'bg-gradient-to-br from-slate-950/90 via-cyan-900/70 to-blue-700/80',
    animation: 'animate-pulse-neon',
    ornament: '⚡',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]'
  },
  'Romance': {
    card: 'genre-romance',
    border: 'border-romance',
    gradient: 'bg-gradient-to-br from-pink-300/80 via-rose-400/60 to-pink-500/80',
    animation: 'animate-gentle-float',
    ornament: '♥',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(244,114,182,0.4)]'
  },
  'Western': {
    card: 'genre-western',
    border: 'border-western',
    gradient: 'bg-gradient-to-br from-amber-900/80 via-orange-800/70 to-yellow-700/80',
    animation: 'animate-dust-settle',
    ornament: '⭐',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(217,119,6,0.3)]'
  },
  'Slice of Life': {
    card: 'genre-slice-of-life',
    border: 'border-slice-of-life',
    gradient: 'bg-gradient-to-br from-amber-50/80 via-stone-100/70 to-amber-100/80',
    animation: 'animate-gentle-float',
    ornament: '☕',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(120,113,108,0.2)]'
  },
  'Mystère/Thriller': {
    card: 'genre-mystery',
    border: 'border-mystery',
    gradient: 'bg-gradient-to-br from-slate-950/90 via-gray-800/80 to-slate-900/90',
    animation: 'animate-shadow-move',
    ornament: '🔍',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(30,30,30,0.6)]'
  },
  'Horreur': {
    card: 'genre-horror',
    border: 'border-horror',
    gradient: 'bg-gradient-to-br from-black/90 via-red-950/80 to-red-900/80',
    animation: 'animate-sinister-pulse',
    ornament: '🩸',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(127,29,29,0.5)]'
  },
  'Aventure': {
    card: 'genre-adventure',
    border: 'border-adventure',
    gradient: 'bg-gradient-to-br from-amber-800/80 via-emerald-700/70 to-teal-700/80',
    animation: 'animate-map-wave',
    ornament: '⚔️',
    hoverGlow: 'hover:shadow-[0_0_35px_rgba(5,150,105,0.4)]'
  },
  'Comédie': {
    card: 'genre-comedy',
    border: 'border-comedy',
    gradient: 'bg-gradient-to-br from-yellow-400/80 via-orange-400/70 to-amber-500/80',
    animation: 'animate-bounce-joy',
    ornament: '😄',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(251,191,36,0.5)]'
  },
  'Drame': {
    card: 'genre-drama',
    border: 'border-drama',
    gradient: 'bg-gradient-to-br from-gray-700/80 via-slate-800/70 to-gray-900/80',
    animation: 'animate-curtain-open',
    ornament: '🎭',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(71,85,105,0.4)]'
  },
  'Historique': {
    card: 'genre-historical',
    border: 'border-historical',
    gradient: 'bg-gradient-to-br from-amber-700/80 via-yellow-800/70 to-amber-800/80',
    animation: 'animate-aging-paper',
    ornament: '📜',
    hoverGlow: 'hover:shadow-[0_0_35px_rgba(180,83,9,0.4)]'
  },
  'Biographie': {
    card: 'genre-biography',
    border: 'border-biography',
    gradient: 'bg-gradient-to-br from-stone-600/80 via-amber-700/70 to-stone-700/80',
    animation: 'animate-page-turn',
    ornament: '📖',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(120,113,108,0.3)]'
  },
  'Policier': {
    card: 'genre-police',
    border: 'border-police',
    gradient: 'bg-gradient-to-br from-blue-950/90 via-slate-800/80 to-gray-900/90',
    animation: 'animate-spotlight',
    ornament: '🕵️',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(30,58,138,0.4)]'
  },
  'Érotisme': {
    card: 'genre-erotic',
    border: 'border-erotic',
    gradient: 'bg-gradient-to-br from-red-900/80 via-rose-800/70 to-black/90',
    animation: 'animate-satin-wave',
    ornament: '🌹',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(159,18,57,0.5)]'
  },
  'Dystopie': {
    card: 'genre-dystopia',
    border: 'border-dystopia',
    gradient: 'bg-gradient-to-br from-gray-900/90 via-emerald-950/80 to-slate-900/90',
    animation: 'animate-glitch',
    ornament: '⚙️',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(6,78,59,0.4)]'
  }
};
