import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TextSizeControls } from './TextSizeControls';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Search,
  Download,
  Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TextReaderProps {
  title: string;
  content: string;
  onBack?: () => void;
  showControls?: boolean;
  wordsPerPage?: number;
}

export const TextReader: React.FC<TextReaderProps> = ({
  title,
  content,
  onBack,
  showControls = true,
  wordsPerPage = 500
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);

  // Split content into pages
  const words = content.split(/\s+/);
  const totalPages = Math.ceil(words.length / wordsPerPage);
  
  const getCurrentPageContent = () => {
    const startIndex = currentPage * wordsPerPage;
    const endIndex = Math.min((currentPage + 1) * wordsPerPage, words.length);
    return words.slice(startIndex, endIndex).join(' ');
  };

  // Search functionality
  useEffect(() => {
    if (searchTerm.length > 2) {
      const results: number[] = [];
      const searchRegex = new RegExp(searchTerm, 'gi');
      
      for (let page = 0; page < totalPages; page++) {
        const pageStartIndex = page * wordsPerPage;
        const pageEndIndex = Math.min((page + 1) * wordsPerPage, words.length);
        const pageContent = words.slice(pageStartIndex, pageEndIndex).join(' ');
        
        if (searchRegex.test(pageContent)) {
          results.push(page);
        }
      }
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, content, wordsPerPage]);

  const highlightSearchTerm = (text: string) => {
    if (!searchTerm || searchTerm.length < 3) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark> : part
    );
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToSearchResult = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const downloadAsText = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTextStyle = () => ({
    fontSize: `${fontSize}px`,
    lineHeight: '1.6',
    color: highContrast ? '#000' : undefined,
    backgroundColor: highContrast ? '#fff' : undefined,
    padding: highContrast ? '1rem' : undefined,
    borderRadius: highContrast ? '0.5rem' : undefined
  });

  if (!content || content.trim().length === 0) {
    return (
      <Card className="p-6 text-center">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Aucun contenu à afficher</p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadAsText}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            {showControls && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHighContrast(!highContrast)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Contraste
              </Button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans le texte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {searchResults.length} résultat(s)
              </span>
              <div className="flex gap-1">
                {searchResults.slice(0, 5).map((pageIndex) => (
                  <Button
                    key={pageIndex}
                    variant="outline"
                    size="sm"
                    onClick={() => goToSearchResult(pageIndex)}
                    className={currentPage === pageIndex ? 'bg-primary/10' : ''}
                  >
                    {pageIndex + 1}
                  </Button>
                ))}
                {searchResults.length > 5 && (
                  <span className="text-sm text-muted-foreground">...</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Text controls */}
        {showControls && (
          <TextSizeControls
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            highContrast={highContrast}
            onHighContrastChange={setHighContrast}
          />
        )}
      </div>

      <Separator />

      {/* Main content */}
      <Card className="min-h-[600px]">
        <div className="p-8" style={getTextStyle()}>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {highlightSearchTerm(getCurrentPageContent())}
          </div>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="border-t p-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={previousPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Page précédente
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} sur {totalPages}
              </span>
              <Progress 
                value={(currentPage + 1) / totalPages * 100} 
                className="w-32"
              />
            </div>

            <Button
              variant="outline"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
            >
              Page suivante
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </Card>

      {/* Reading statistics */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Mots: ~{words.length.toLocaleString()}</span>
          <span>Pages: {totalPages}</span>
          <span>Temps de lecture estimé: ~{Math.ceil(words.length / 200)} min</span>
        </div>
      </Card>
    </div>
  );
};