import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Sparkles } from 'lucide-react';
import { orydorsCodeService } from "@/services/orydorsCodeService";
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from "@/contexts/UserStatsContext";

export const OrydorsCodeRedemption: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { loadUserStats } = useUserStats();

  const handleRedeemCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await orydorsCodeService.redeemCode({ code: code.trim() });
      
      if (response.success) {
        toast({
          title: "Code utilisé avec succès !",
          description: response.message,
        });
        setCode('');
        // Recharger les stats pour mettre à jour le compteur d'Orydors
        await loadUserStats();
      } else {
        toast({
          title: "Erreur",
          description: response.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'utilisation du code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRedeemCode();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <Gift className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Code Orydors
        </CardTitle>
        <CardDescription>
          Saisissez votre code pour obtenir des points Orydors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="promo-code">Code promo</Label>
          <Input
            id="promo-code"
            type="text"
            placeholder="Entrez votre code (ex: ABC12345)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            maxLength={8}
            className="text-center font-mono text-lg tracking-wider"
          />
        </div>
        
        <Button 
          onClick={handleRedeemCode}
          disabled={isLoading || !code.trim()}
          className="w-full"
        >
          {isLoading ? "Vérification..." : "Utiliser le code"}
        </Button>
        
        <div className="text-xs text-muted-foreground text-center">
          Les codes sont composés de 8 caractères alphanumériques
        </div>
      </CardContent>
    </Card>
  );
};
