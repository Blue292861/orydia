
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { sanitizeTag, validateTextLength } from '@/utils/security';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmedTag = inputValue.trim();
    
    if (!trimmedTag) return;
    
    if (!validateTextLength(trimmedTag, 50)) {
      console.warn('Tag too long, maximum 50 characters allowed');
      return;
    }
    
    if (tags.length >= 10) {
      console.warn('Maximum 10 tags allowed');
      return;
    }
    
    // Sanitize only when adding, allow spaces in tags
    const sanitizedTag = sanitizeTag(trimmedTag);
    
    if (!tags.includes(sanitizedTag)) {
      onTagsChange([...tags, sanitizedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateTextLength(value, 50)) {
      setInputValue(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Add a tag..."
          className="flex-1"
          maxLength={50}
        />
        <Button type="button" onClick={addTag} size="sm" disabled={!inputValue.trim() || tags.length >= 10}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {tags.length >= 10 && (
        <p className="text-sm text-muted-foreground">Maximum number of tags reached (10)</p>
      )}
    </div>
  );
};
