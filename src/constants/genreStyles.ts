import { LiteraryGenre } from './genres';

export interface GenreStyle {
  borderColor: string;
  accentColor: string;
  ornament: string;
}

export const GENRE_STYLES: Record<LiteraryGenre, GenreStyle> = {
  'Fantaisie': {
    borderColor: 'border-amber-500',
    accentColor: 'rgba(245, 158, 11, 0.15)',
    ornament: '✦'
  },
  'Fantastique': {
    borderColor: 'border-indigo-400',
    accentColor: 'rgba(129, 140, 248, 0.15)',
    ornament: '🌙'
  },
  'Science-Fiction': {
    borderColor: 'border-cyan-400',
    accentColor: 'rgba(34, 211, 238, 0.15)',
    ornament: '⚡'
  },
  'Romance': {
    borderColor: 'border-rose-300',
    accentColor: 'rgba(253, 164, 175, 0.15)',
    ornament: '♥'
  },
  'Western': {
    borderColor: 'border-amber-700',
    accentColor: 'rgba(180, 83, 9, 0.15)',
    ornament: '⭐'
  },
  'Slice of Life': {
    borderColor: 'border-stone-400',
    accentColor: 'rgba(168, 162, 158, 0.15)',
    ornament: '☕'
  },
  'Mystère/Thriller': {
    borderColor: 'border-slate-600',
    accentColor: 'rgba(71, 85, 105, 0.15)',
    ornament: '🔍'
  },
  'Horreur': {
    borderColor: 'border-red-900',
    accentColor: 'rgba(127, 29, 29, 0.15)',
    ornament: '🩸'
  },
  'Aventure': {
    borderColor: 'border-emerald-600',
    accentColor: 'rgba(5, 150, 105, 0.15)',
    ornament: '⚔️'
  },
  'Comédie': {
    borderColor: 'border-yellow-500',
    accentColor: 'rgba(234, 179, 8, 0.15)',
    ornament: '😄'
  },
  'Drame': {
    borderColor: 'border-slate-500',
    accentColor: 'rgba(100, 116, 139, 0.15)',
    ornament: '🎭'
  },
  'Historique': {
    borderColor: 'border-amber-600',
    accentColor: 'rgba(217, 119, 6, 0.15)',
    ornament: '📜'
  },
  'Biographie': {
    borderColor: 'border-stone-600',
    accentColor: 'rgba(87, 83, 78, 0.15)',
    ornament: '📖'
  },
  'Policier': {
    borderColor: 'border-blue-800',
    accentColor: 'rgba(30, 64, 175, 0.15)',
    ornament: '🕵️'
  },
  'Érotisme': {
    borderColor: 'border-rose-800',
    accentColor: 'rgba(159, 18, 57, 0.15)',
    ornament: '🌹'
  },
  'Dystopie': {
    borderColor: 'border-emerald-900',
    accentColor: 'rgba(6, 78, 59, 0.15)',
    ornament: '⚙️'
  }
};
