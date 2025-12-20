import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Crown, TrendingUp, PieChart, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  premiumPercentage: number;
  monthlyUsers: number;
  annualUsers: number;
  monthlyAnnualRatio: number;
  adminCount: number;
}

export const AdminStatsPage: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    premiumPercentage: 0,
    monthlyUsers: 0,
    annualUsers: 0,
    monthlyAnnualRatio: 0,
    adminCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Récupérer les IDs des admins pour les exclure des stats
      const { data: adminRoles, error: adminError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminError) throw adminError;

      const adminIds = adminRoles?.map(r => r.user_id) || [];
      const adminCount = adminIds.length;

      // Récupérer le nombre total d'utilisateurs (excluant les admins)
      let userQuery = supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // Si on a des admins, les exclure
      if (adminIds.length > 0) {
        userQuery = userQuery.not('id', 'in', `(${adminIds.join(',')})`);
      }

      const { count: totalUsers, error: userError } = await userQuery;

      if (userError) throw userError;

      // Récupérer les données d'abonnement (excluant les admins)
      let subQuery = supabase
        .from('subscribers')
        .select('user_id, subscribed, subscription_tier');

      if (adminIds.length > 0) {
        subQuery = subQuery.not('user_id', 'in', `(${adminIds.join(',')})`);
      }

      const { data: subscriptionData, error: subError } = await subQuery;

      if (subError) throw subError;

      // Calculer les statistiques
      const premiumUsers = subscriptionData?.filter(sub => sub.subscribed === true).length || 0;
      const freeUsers = (totalUsers || 0) - premiumUsers;
      const premiumPercentage = totalUsers ? Math.round((premiumUsers / totalUsers) * 100) : 0;

      // Compter les abonnements mensuels vs annuels
      const premiumSubscriptions = subscriptionData?.filter(sub => sub.subscribed === true) || [];
      const monthlyUsers = premiumSubscriptions.filter(sub => 
        sub.subscription_tier?.toLowerCase().includes('monthly') || 
        sub.subscription_tier?.toLowerCase().includes('mensuel')
      ).length;
      
      const annualUsers = premiumSubscriptions.filter(sub => 
        sub.subscription_tier?.toLowerCase().includes('annual') || 
        sub.subscription_tier?.toLowerCase().includes('annuel') ||
        sub.subscription_tier?.toLowerCase().includes('yearly')
      ).length;

      // Pour les abonnements manuels ou autres, les considérer comme mensuels par défaut
      const otherPremiumUsers = premiumUsers - monthlyUsers - annualUsers;
      const adjustedMonthlyUsers = monthlyUsers + otherPremiumUsers;

      const monthlyAnnualRatio = premiumUsers > 0 ? 
        Math.round((adjustedMonthlyUsers / premiumUsers) * 100) : 0;

      setStats({
        totalUsers: totalUsers || 0,
        premiumUsers,
        freeUsers,
        premiumPercentage,
        monthlyUsers: adjustedMonthlyUsers,
        annualUsers,
        monthlyAnnualRatio,
        adminCount,
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Statistiques Utilisateurs</h1>
        <p className="text-muted-foreground">Vue d'ensemble des utilisateurs et abonnements (admins exclus)</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {/* Utilisateurs Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Hors admins
            </p>
          </CardContent>
        </Card>

        {/* Utilisateurs Premium */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Premium</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            <p className="text-xs text-muted-foreground">
              Abonnés actifs
            </p>
          </CardContent>
        </Card>

        {/* Ratio Premium/Freemium */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ratio Premium/Freemium</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.freeUsers} utilisateurs gratuits
            </p>
          </CardContent>
        </Card>

        {/* Ratio Mensuel/Annuel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ratio Mensuel/Annuel</CardTitle>
            <PieChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyAnnualRatio}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyUsers}M / {stats.annualUsers}A
            </p>
          </CardContent>
        </Card>

        {/* Comptes Admin */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comptes Admin</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminCount}</div>
            <p className="text-xs text-muted-foreground">
              Exclus des stats
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Détails supplémentaires */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Utilisateurs Premium</span>
                <span className="font-medium">{stats.premiumUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Utilisateurs Gratuits</span>
                <span className="font-medium">{stats.freeUsers}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${stats.premiumPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Types d'Abonnements Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Abonnements Mensuels</span>
                <span className="font-medium">{stats.monthlyUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Abonnements Annuels</span>
                <span className="font-medium">{stats.annualUsers}</span>
              </div>
              {stats.premiumUsers > 0 && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.monthlyAnnualRatio}%` }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
