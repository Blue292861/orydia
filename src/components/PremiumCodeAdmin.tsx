import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Download, RefreshCw } from 'lucide-react';
import { premiumCodeService } from "@/services/premiumCodeService";
import { PremiumCode } from '@/types/PremiumCode';
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const PremiumCodeAdmin: React.FC = () => {
  const [codes, setCodes] = useState<PremiumCode[]>([]);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    custom_code: '',
    subscription_type: 'monthly' as 'monthly' | 'annual',
    duration_months: 1,
    max_uses: '',
    expires_at: '',
    is_single_use: true,
    quantity: 1
  });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const data = await premiumCodeService.getAllCodes();
      setCodes(data);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les codes",
        variant: "destructive"
      });
    }
  };

  const handleGenerateCodes = async () => {
    setIsLoading(true);
    try {
      const generatedCodes = await premiumCodeService.generateCodes({
        custom_code: formData.custom_code || undefined,
        subscription_type: formData.subscription_type,
        duration_months: formData.duration_months,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined,
        expires_at: formData.expires_at || undefined,
        is_single_use: formData.is_single_use,
        quantity: formData.quantity
      });

      if (generatedCodes.length > 1) {
        premiumCodeService.downloadCSV(generatedCodes, `premium_codes_${Date.now()}.csv`);
      }

      await loadCodes();
      setIsGenerateDialogOpen(false);
      
      toast({
        title: "Codes générés",
        description: `${generatedCodes.length} code(s) premium créé(s) avec succès`
      });

      setFormData({
        custom_code: '',
        subscription_type: 'monthly',
        duration_months: 1,
        max_uses: '',
        expires_at: '',
        is_single_use: true,
        quantity: 1
      });
    } catch (error) {
      console.error('Error generating codes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les codes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code ?')) return;

    try {
      await premiumCodeService.deleteCode(codeId);
      await loadCodes();
      toast({
        title: "Code supprimé",
        description: "Le code a été supprimé avec succès"
      });
    } catch (error) {
      console.error('Error deleting code:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le code",
        variant: "destructive"
      });
    }
  };

  const handleDownloadCSV = () => {
    premiumCodeService.downloadCSV(codes, `all_premium_codes_${Date.now()}.csv`);
    toast({
      title: "Téléchargement",
      description: "Le fichier CSV a été téléchargé"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Codes Premium</h2>
          <p className="text-muted-foreground">Créer et gérer les codes d'accès premium</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadCodes} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          {codes.length > 0 && (
            <Button onClick={handleDownloadCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          )}
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Générer des codes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Générer des codes premium</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subscription_type">Type d'abonnement</Label>
                  <Select
                    value={formData.subscription_type}
                    onValueChange={(value: 'monthly' | 'annual') => 
                      setFormData({ ...formData, subscription_type: value })
                    }
                  >
                    <SelectTrigger id="subscription_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="annual">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration_months">Durée (mois)</Label>
                  <Input
                    id="duration_months"
                    type="number"
                    min="1"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div>
                  <Label htmlFor="custom_code">Code personnalisé (optionnel)</Label>
                  <Input
                    id="custom_code"
                    placeholder="20 caractères max"
                    value={formData.custom_code}
                    onChange={(e) => setFormData({ ...formData, custom_code: e.target.value.toUpperCase() })}
                    maxLength={20}
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Nombre de codes</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    disabled={!!formData.custom_code}
                  />
                  {formData.custom_code && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Un seul code peut être créé avec un code personnalisé
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="max_uses">Utilisations max (optionnel)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    min="1"
                    placeholder="Illimité"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="expires_at">Date d'expiration (optionnel)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_single_use"
                    checked={formData.is_single_use}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_single_use: checked })}
                  />
                  <Label htmlFor="is_single_use">Usage unique par utilisateur</Label>
                </div>

                <Button onClick={handleGenerateCodes} disabled={isLoading} className="w-full">
                  {isLoading ? "Génération..." : "Générer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Codes générés ({codes.length})</CardTitle>
          <CardDescription>Liste de tous les codes premium créés</CardDescription>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun code généré</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Usages</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono font-bold">{code.code}</TableCell>
                    <TableCell>
                      <Badge variant={code.subscription_type === 'annual' ? 'default' : 'secondary'}>
                        {code.subscription_type === 'monthly' ? 'Mensuel' : 'Annuel'}
                      </Badge>
                    </TableCell>
                    <TableCell>{code.duration_months} mois</TableCell>
                    <TableCell>
                      {code.current_uses} / {code.max_uses || '∞'}
                    </TableCell>
                    <TableCell>
                      {code.expires_at 
                        ? format(new Date(code.expires_at), 'Pp', { locale: fr })
                        : 'Jamais'
                      }
                    </TableCell>
                    <TableCell>
                      {format(new Date(code.created_at), 'P', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCode(code.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
