import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Copy } from 'lucide-react';
import { orydorsCodeService } from "@/services/orydorsCodeService";
import { OrydorsCode } from "@/types/OrydorsCode";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const OrydorsCodeAdmin: React.FC = () => {
  const [codes, setCodes] = useState<OrydorsCode[]>([]);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    custom_code: '',
    points_value: 10,
    max_uses: '',
    expires_at: '',
    is_single_use: true,
    quantity: 1
  });

  const loadCodes = async () => {
    try {
      const data = await orydorsCodeService.getAllCodes();
      setCodes(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les codes",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleGenerateCodes = async () => {
    if (formData.points_value <= 0) {
      toast({
        title: "Erreur",
        description: "Le nombre de points doit être supérieur à 0",
        variant: "destructive"
      });
      return;
    }

    if (formData.custom_code && formData.quantity > 1) {
      toast({
        title: "Erreur",
        description: "Impossible de générer plusieurs codes avec un code personnalisé",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const request = {
        custom_code: formData.custom_code || undefined,
        points_value: formData.points_value,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined,
        expires_at: formData.expires_at || undefined,
        is_single_use: formData.is_single_use,
        quantity: formData.custom_code ? 1 : formData.quantity
      };

      await orydorsCodeService.generateCodes(request);
      
      toast({
        title: "Succès",
        description: `${request.quantity} code(s) généré(s) avec succès`,
      });

      // Reset form
      setFormData({
        custom_code: '',
        points_value: 10,
        max_uses: '',
        expires_at: '',
        is_single_use: true,
        quantity: 1
      });

      setIsGenerateDialogOpen(false);
      loadCodes();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la génération",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      await orydorsCodeService.deleteCode(codeId);
      toast({
        title: "Succès",
        description: "Code supprimé",
      });
      loadCodes();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copié",
      description: "Code copié dans le presse-papiers",
    });
  };

  const getCodeStatus = (code: OrydorsCode) => {
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return <Badge variant="destructive">Expiré</Badge>;
    }
    if (code.max_uses && code.current_uses >= code.max_uses) {
      return <Badge variant="secondary">Épuisé</Badge>;
    }
    return <Badge variant="default">Actif</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Codes Orydors</h2>
          <p className="text-muted-foreground">
            Gérez les codes promo pour distribuer des points Orydors
          </p>
        </div>
        
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Générer des codes
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Générer des codes Orydors</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom_code">Code personnalisé (optionnel)</Label>
                <Input
                  id="custom_code"
                  value={formData.custom_code}
                  onChange={(e) => setFormData({ ...formData, custom_code: e.target.value.toUpperCase() })}
                  placeholder="20 caractères max"
                  maxLength={20}
                />
              </div>

              <div>
                <Label htmlFor="quantity">Nombre de codes à générer</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  disabled={!!formData.custom_code}
                />
              </div>

              <div>
                <Label htmlFor="points_value">Points attribués par le code</Label>
                <Input
                  id="points_value"
                  type="number"
                  min="1"
                  value={formData.points_value}
                  onChange={(e) => setFormData({ ...formData, points_value: parseInt(e.target.value) || 10 })}
                />
              </div>

              <div>
                <Label htmlFor="max_uses">Nombre d'utilisations max (optionnel)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Illimité si vide"
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

      <Card>
        <CardHeader>
          <CardTitle>Codes générés ({codes.length})</CardTitle>
          <CardDescription>
            Liste de tous les codes Orydors créés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Utilisations</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono">
                      <div className="flex items-center space-x-2">
                        <span>{code.code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCodeToClipboard(code.code)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{code.points_value}</TableCell>
                    <TableCell>
                      {code.current_uses}
                      {code.max_uses ? `/${code.max_uses}` : '/∞'}
                    </TableCell>
                    <TableCell>
                      {code.expires_at 
                        ? format(new Date(code.expires_at), "dd/MM/yyyy HH:mm", { locale: fr })
                        : 'Jamais'
                      }
                    </TableCell>
                    <TableCell>{getCodeStatus(code)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCode(code.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
