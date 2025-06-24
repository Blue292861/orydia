
import { useState, useEffect } from 'react';
import { FormConfig } from '@/types/FormField';

export const useFormConfig = (formId: string, defaultConfig: FormConfig) => {
  const [config, setConfig] = useState<FormConfig>(defaultConfig);

  useEffect(() => {
    const savedConfig = localStorage.getItem(`${formId}-config`);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    }
  }, [formId]);

  const saveConfig = (newConfig: FormConfig) => {
    setConfig(newConfig);
    localStorage.setItem(`${formId}-config`, JSON.stringify(newConfig));
  };

  return { config, saveConfig };
};
