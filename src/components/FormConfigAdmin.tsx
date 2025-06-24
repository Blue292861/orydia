
import React, { useState, useEffect } from 'react';
import { FormConfig, FormFieldConfig } from '@/types/FormField';
import { FormFieldEditor } from '@/components/FormFieldEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Configuration par défaut pour les livres
const defaultBookFormConfig: FormConfig = {
  id: 'book-form',
  name: 'Formulaire de livre',
  fields: [
    {
      id: 'title',
      name: 'title',
      label: 'Titre du livre',
      type: 'text',
      required: true,
      maxLength: 200,
      order: 0
    },
    {
      id: 'author',
      name: 'author',
      label: 'Auteur',
      type: 'text',
      required: true,
      maxLength: 100,
      order: 1
    },
    {
      id: 'coverUrl',
      name: 'coverUrl',
      label: 'URL de l\'image de couverture',
      type: 'file',
      required: true,
      order: 2
    },
    {
      id: 'points',
      name: 'points',
      label: 'Récompense en points',
      type: 'number',
      required: true,
      min: 0,
      max: 100000,
      order: 3
    },
    {
      id: 'isPremium',
      name: 'isPremium',
      label: 'Livre Premium',
      type: 'toggle',
      required: false,
      order: 4
    },
    {
      id: 'isMonthSuccess',
      name: 'isMonthSuccess',
      label: 'Succès du mois',
      type: 'toggle',
      required: false,
      order: 5
    },
    {
      id: 'isPacoFavourite',
      name: 'isPacoFavourite',
      label: 'Coup de coeur de Paco',
      type: 'toggle',
      required: false,
      order: 6
    },
    {
      id: 'tags',
      name: 'tags',
      label: 'Étiquettes',
      type: 'text',
      required: false,
      order: 7
    },
    {
      id: 'content',
      name: 'content',
      label: 'Contenu du livre',
      type: 'textarea',
      required: true,
      maxLength: 500000,
      order: 8
    }
  ]
};

export const FormConfigAdmin: React.FC = () => {
  const [bookFormConfig, setBookFormConfig] = useState<FormConfig>(defaultBookFormConfig);
  const { toast } = useToast();

  // Charger la configuration depuis le localStorage au démarrage
  useEffect(() => {
    const savedConfig = localStorage.getItem('book-form-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setBookFormConfig(config);
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    }
  }, []);

  const saveConfiguration = () => {
    try {
      localStorage.setItem('book-form-config', JSON.stringify(bookFormConfig));
      toast({
        title: 'Configuration sauvegardée',
        description: 'La configuration du formulaire a été sauvegardée avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration.',
        variant: 'destructive',
      });
    }
  };

  const resetToDefault = () => {
    setBookFormConfig(defaultBookFormConfig);
    localStorage.removeItem('book-form-config');
    toast({
      title: 'Configuration réinitialisée',
      description: 'La configuration du formulaire a été remise par défaut.',
    });
  };

  const handleFieldsChange = (fields: FormFieldConfig[]) => {
    setBookFormConfig(prev => ({
      ...prev,
      fields: fields.sort((a, b) => a.order - b.order)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Configuration des formulaires</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefault}>
            Réinitialiser
          </Button>
          <Button onClick={saveConfiguration}>
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="books" className="w-full">
        <TabsList>
          <TabsTrigger value="books">Formulaire des livres</TabsTrigger>
        </TabsList>
        
        <TabsContent value="books">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du formulaire d'ajout de livres</CardTitle>
            </CardHeader>
            <CardContent>
              <FormFieldEditor
                fields={bookFormConfig.fields}
                onFieldsChange={handleFieldsChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
