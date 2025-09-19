import React from 'react';
import { LITERARY_GENRES, LiteraryGenre } from '@/constants/genres';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface GenreSelectorProps {
  selectedGenres: LiteraryGenre[];
  onGenresChange: (genres: LiteraryGenre[]) => void;
  label?: string;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  selectedGenres,
  onGenresChange,
  label = "Genres littéraires"
}) => {
  const toggleGenre = (genre: LiteraryGenre) => {
    const updatedGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    onGenresChange(updatedGenres);
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">{label}</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
        {LITERARY_GENRES.map((genre) => (
          <div key={genre} className="flex items-center space-x-2">
            <Checkbox
              id={genre}
              checked={selectedGenres.includes(genre)}
              onCheckedChange={() => toggleGenre(genre)}
            />
            <Label
              htmlFor={genre}
              className="text-sm cursor-pointer leading-tight"
            >
              {genre}
            </Label>
          </div>
        ))}
      </div>
      {selectedGenres.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedGenres.length} genre(s) sélectionné(s)
        </div>
      )}
    </div>
  );
};