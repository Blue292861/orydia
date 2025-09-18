import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface AdaptiveTextProps {
  vocabularyKey: string;
  fallback?: string;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children?: React.ReactNode;
}

export const AdaptiveText: React.FC<AdaptiveTextProps> = ({
  vocabularyKey,
  fallback,
  className,
  as: Component = 'span',
  children
}) => {
  const { getVocabulary } = useTheme();
  
  const text = getVocabulary(vocabularyKey, fallback);
  
  return (
    <Component 
      className={cn(className)}
    >
      {text}
      {children}
    </Component>
  );
};