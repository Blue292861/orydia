import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, Plus, Copy, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  id: string;
  key_name: string;
  app_name: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
  usage_count: number;
}

export const ApiKeysAdmin: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newAppName, setNewAppName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['award_points']);
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [showKey, setShowKey] = useState(false);

  const availablePermissions = [
    { id: 'award_points', label: 'Attribuer des points', description: 'Permet d\'attribuer des points aux utilisateurs' },
    { id: 'view_stats', label: 'Voir les statistiques', description: 'Permet de consulter les statistiques des utilisateurs' },
    { id: 'manage_achievements', label: 'Gérer les achievements', description: 'Permet de créer et modifier les achievements' }
  ];

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clés API:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les clés API.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim() || !newAppName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-api-key', {
        body: {
          key_name: newKeyName,
          app_name: newAppName,
          permissions: selectedPermissions
        }
      });

      if (error) throw error;

      setGeneratedKey(data.api_key);
      setShowKey(true);
      setNewKeyName('');
      setNewAppName('');
      setSelectedPermissions(['award_points']);
      setShowCreateForm(false);
      
      toast({
        title: 'Succès',
        description: 'Clé API créée avec succès.',
      });

      await loadApiKeys();
    } catch (error) {
      console.error('Erreur lors de la création de la clé API:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la clé API.',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copié',
        description: 'Clé API copiée dans le presse-papiers.',
      });
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  if (isLoading) {
    return <div className="p-4">Chargement des clés API...</div>;
  }

  return (
    <div className="h-full max-h-screen overflow-y-auto space-y-6 pr-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gestion des Clés API
          </CardTitle>
          <CardDescription>
            Gérez les clés API pour permettre aux applications externes d'interagir avec le système de points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Clés API Existantes</h3>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Clé API
            </Button>
          </div>

          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Créer une Nouvelle Clé API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="keyName">Nom de la clé</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="ex: Boutique E-commerce"
                  />
                </div>
                <div>
                  <Label htmlFor="appName">Nom de l'application</Label>
                  <Input
                    id="appName"
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="ex: MonShop"
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="space-y-2 mt-2">
                    {availablePermissions.map((perm) => (
                      <div key={perm.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={perm.id}
                          checked={selectedPermissions.includes(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                        />
                        <div className="space-y-1">
                          <Label htmlFor={perm.id} className="text-sm font-medium">
                            {perm.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{perm.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={createApiKey}>Créer</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {generatedKey && showKey && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Clé API Générée</CardTitle>
                <CardDescription className="text-green-600">
                  Copiez cette clé maintenant. Elle ne sera plus affichée après fermeture.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input 
                    value={generatedKey} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard(generatedKey)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copier
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowKey(false)}
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Application</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Utilisation</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Dernière utilisation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.key_name}</TableCell>
                  <TableCell>{key.app_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={key.is_active ? "default" : "secondary"}>
                      {key.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{key.usage_count} fois</TableCell>
                  <TableCell>
                    {new Date(key.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {key.last_used_at 
                      ? new Date(key.last_used_at).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {apiKeys.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune clé API créée pour le moment.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};