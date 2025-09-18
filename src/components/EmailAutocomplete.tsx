import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Check, Mail } from 'lucide-react';

interface EmailAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const EmailAutocomplete: React.FC<EmailAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "utilisateur@example.com",
  className,
  required = false
}) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmailSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_user_emails', { p_query: query });
      
      if (!error && data) {
        setSuggestions(data.map(item => item.email));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching email suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchEmailSuggestions(value);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className={cn("pl-10", className)}
            required={required}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un email..." value={value} onValueChange={onChange} />
          <CommandList>
            {loading ? (
              <CommandEmpty>Recherche...</CommandEmpty>
            ) : suggestions.length === 0 ? (
              <CommandEmpty>Aucun email trouvé</CommandEmpty>
            ) : (
              <CommandGroup>
                {suggestions.map((email) => (
                  <CommandItem
                    key={email}
                    value={email}
                    onSelect={(selectedValue) => {
                      onChange(selectedValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === email ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {email}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};