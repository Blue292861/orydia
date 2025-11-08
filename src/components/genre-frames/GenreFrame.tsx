import React from 'react';
import { LiteraryGenre } from '@/constants/genres';
import { RomanceFrame } from './frames/RomanceFrame';
import { FantasyFrame } from './frames/FantasyFrame';
import { SciFiFrame } from './frames/SciFiFrame';
import { HorrorFrame } from './frames/HorrorFrame';
import { WesternFrame } from './frames/WesternFrame';
import { SliceOfLifeFrame } from './frames/SliceOfLifeFrame';
import { MysteryFrame } from './frames/MysteryFrame';
import { AdventureFrame } from './frames/AdventureFrame';
import { ComedyFrame } from './frames/ComedyFrame';
import { DramaFrame } from './frames/DramaFrame';
import { HistoricalFrame } from './frames/HistoricalFrame';
import { BiographyFrame } from './frames/BiographyFrame';
import { PoliceFrame } from './frames/PoliceFrame';
import { ErotismFrame } from './frames/ErotismFrame';
import { DystopiaFrame } from './frames/DystopiaFrame';
import { FantasticFrame } from './frames/FantasticFrame';

interface GenreFrameProps {
  genre: LiteraryGenre;
  className?: string;
}

const FRAME_COMPONENTS: Record<LiteraryGenre, React.FC<{ className?: string }>> = {
  'Romance': RomanceFrame,
  'Fantaisie': FantasyFrame,
  'Science-Fiction': SciFiFrame,
  'Horreur': HorrorFrame,
  'Western': WesternFrame,
  'Slice of Life': SliceOfLifeFrame,
  'Mystère/Thriller': MysteryFrame,
  'Aventure': AdventureFrame,
  'Comédie': ComedyFrame,
  'Drame': DramaFrame,
  'Historique': HistoricalFrame,
  'Biographie': BiographyFrame,
  'Policier': PoliceFrame,
  'Érotisme': ErotismFrame,
  'Dystopie': DystopiaFrame,
  'Fantastique': FantasticFrame,
};

export const GenreFrame: React.FC<GenreFrameProps> = ({ genre, className = '' }) => {
  const FrameComponent = FRAME_COMPONENTS[genre];
  
  if (!FrameComponent) return null;
  
  return <FrameComponent className={className} />;
};
