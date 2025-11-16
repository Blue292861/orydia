import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, DollarSign, TrendingUp, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BudgetInfo {
  id: string;
  month_year: string;
  budget_usd: number;
  spent_usd: number;
  remaining_usd: number;
  alert_threshold_pct: number;
  is_over_threshold: boolean;
}

export const TranslationBudgetManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newBudget, setNewBudget] = useState<string>('');
  const [newThreshold, setNewThreshold] = useState<string>('');

  // Fetch current month budget
  const { data: budget, isLoading } = useQuery({
    queryKey: ['translation-budget'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_month_budget');
      if (error) throw error;
      return data && data.length > 0 ? data[0] as BudgetInfo : null;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update budget mutation
  const updateBudgetMutation = useMutation({
    mutationFn: async ({ budget_usd, alert_threshold_pct }: { budget_usd?: number; alert_threshold_pct?: number }) => {
      if (!budget) throw new Error('No budget found');

      const updates: any = {};
      if (budget_usd !== undefined) updates.budget_usd = budget_usd;
      if (alert_threshold_pct !== undefined) updates.alert_threshold_pct = alert_threshold_pct;

      const { error } = await supabase
        .from('translation_budget')
        .update(updates)
        .eq('id', budget.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Budget mis à jour',
        description: 'Les paramètres du budget ont été enregistrés avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['translation-budget'] });
      setNewBudget('');
      setNewThreshold('');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de mettre à jour le budget',
        variant: 'destructive',
      });
    },
  });

  const handleUpdateBudget = () => {
    const budgetValue = parseFloat(newBudget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un montant valide',
        variant: 'destructive',
      });
      return;
    }
    updateBudgetMutation.mutate({ budget_usd: budgetValue });
  };

  const handleUpdateThreshold = () => {
    const thresholdValue = parseInt(newThreshold);
    if (isNaN(thresholdValue) || thresholdValue < 0 || thresholdValue > 100) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un pourcentage entre 0 et 100',
        variant: 'destructive',
      });
      return;
    }
    updateBudgetMutation.mutate({ alert_threshold_pct: thresholdValue });
  };

  if (isLoading || !budget) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  const spentPercentage = (budget.spent_usd / budget.budget_usd) * 100;
  const isOverBudget = budget.spent_usd >= budget.budget_usd;

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card className={`p-6 ${isOverBudget ? 'border-destructive' : budget.is_over_threshold ? 'border-orange-500' : ''}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Budget mensuel - {budget.month_year}</h3>
            {isOverBudget && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Budget dépassé</span>
              </div>
            )}
            {!isOverBudget && budget.is_over_threshold && (
              <div className="flex items-center gap-2 text-orange-500">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Seuil d'alerte atteint</span>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Budget total</span>
              </div>
              <p className="text-2xl font-bold">${budget.budget_usd.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Dépensé</span>
              </div>
              <p className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : ''}`}>
                ${budget.spent_usd.toFixed(4)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Restant</span>
              </div>
              <p className={`text-2xl font-bold ${budget.remaining_usd <= 0 ? 'text-destructive' : 'text-green-500'}`}>
                ${Math.max(0, budget.remaining_usd).toFixed(4)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Utilisation du budget</span>
              <span className={`font-medium ${isOverBudget ? 'text-destructive' : ''}`}>
                {spentPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(spentPercentage, 100)} 
              className={`h-3 ${isOverBudget ? '[&>div]:bg-destructive' : budget.is_over_threshold ? '[&>div]:bg-orange-500' : ''}`}
            />
            <p className="text-xs text-muted-foreground">
              Seuil d'alerte à {budget.alert_threshold_pct}%
            </p>
          </div>
        </div>
      </Card>

      {/* Budget Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Paramètres du budget</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Budget mensuel (USD)</Label>
            <div className="flex gap-2">
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                placeholder={budget.budget_usd.toString()}
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleUpdateBudget}
                disabled={!newBudget || updateBudgetMutation.isPending}
                size="icon"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Budget actuel: ${budget.budget_usd.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Seuil d'alerte (%)</Label>
            <div className="flex gap-2">
              <Input
                id="threshold"
                type="number"
                min="0"
                max="100"
                placeholder={budget.alert_threshold_pct.toString()}
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleUpdateThreshold}
                disabled={!newThreshold || updateBudgetMutation.isPending}
                size="icon"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Seuil actuel: {budget.alert_threshold_pct}% (alerte à ${(budget.budget_usd * budget.alert_threshold_pct / 100).toFixed(2)})
            </p>
          </div>
        </div>
      </Card>

      {/* Cost Optimization Tips */}
      <Card className="p-6 bg-primary/5">
        <h3 className="text-lg font-semibold mb-3">💡 Optimisations actives</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✅ Cache de traductions : réutilise les traductions existantes</li>
          <li>✅ Modèles adaptatifs : utilise des modèles moins chers pour les petits chapitres</li>
          <li>✅ Parallélisation : traite jusqu'à 5 chapitres simultanément</li>
          <li>✅ Monitoring : suivi des coûts en temps réel</li>
        </ul>
      </Card>
    </div>
  );
};
