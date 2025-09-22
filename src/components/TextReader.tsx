// src/components/TextReader.tsx
import React from 'react';

interface TextReaderProps {
  content: string;
  onBack?: () => void;
  showControls?: boolean;
}

export const TextReader: React.FC<TextReaderProps> = ({ content }) => {
  return (
    <div className="text-reader p-4">
      <div className="prose dark:prose-invert max-w-none">
        {content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </div>
  );
};
