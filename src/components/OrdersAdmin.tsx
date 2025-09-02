
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/Order';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { checkRateLimit } from '@/utils/security';

const fetchOrders = async (): Promise<Order[]> => {
  try {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Database error:', ordersError.code);
      throw new Error('Erreur de base de données');
    }
    if (!ordersData) return [];

    const userIds = [...new Set(ordersData.map((o) => o.user_id))];
    
    if (userIds.length === 0) {
      return ordersData as Order[];
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, first_name, last_name, city, country')
      .in('id', userIds);

    if (profilesError) {
      console.error('Profiles fetch error:', profilesError.code);
      return ordersData.map((order) => ({
        ...order,
        profiles: null,
      })) as Order[];
    }

    const profilesMap = new Map(
      (profilesData || []).map((p) => [p.id as string, {
        username: p.username,
        avatar_url: p.avatar_url,
        first_name: p.first_name,
        last_name: p.last_name,
        city: p.city,
        country: p.country
      }] as [string, any])
    );

    // Récupérer les emails des utilisateurs
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const usersMap = new Map(
      (usersData?.users || []).map((u) => [u.id, u.email] as [string, string | undefined])
    );

    const ordersWithProfiles = ordersData.map((order) => ({
      ...order,
      profiles: profilesMap.get(order.user_id) || null,
      user_email: usersMap.get(order.user_id) || null,
    }));

    return ordersWithProfiles as Order[];
  } catch (error) {
    console.error('Error in fetchOrders:', error);
    throw error;
  }
};

export const OrdersAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'], 
    queryFn: fetchOrders
  });

  const mutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (!checkRateLimit('order-processing', 10, 60000)) {
        throw new Error('Trop de tentatives, veuillez attendre');
      }

      if (!orderId || typeof orderId !== 'string') {
        throw new Error('ID de commande invalide');
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: 'processed' })
        .eq('id', orderId);

      if (error) {
        console.error('Database error:', error.code);
        throw new Error('Erreur de base de données');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Commande mise à jour',
        description: 'La commande a été marquée comme traitée.',
      });
    },
    onError: (error) => {
       toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour la commande : ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Filtrer les commandes selon le terme de recherche
  const filteredOrders = orders?.filter((order) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      order.item_name.toLowerCase().includes(searchLower) ||
      order.profiles?.username?.toLowerCase().includes(searchLower) ||
      order.profiles?.first_name?.toLowerCase().includes(searchLower) ||
      order.profiles?.last_name?.toLowerCase().includes(searchLower) ||
      order.user_email?.toLowerCase().includes(searchLower) ||
      order.profiles?.city?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const pendingOrders = filteredOrders.filter((o) => o.status === 'pending');
  const processedOrders = filteredOrders.filter((o) => o.status === 'processed');

  if (isLoading) return <div>Chargement des commandes...</div>;
  if (error) return <div>Erreur lors du chargement des commandes</div>;

  return (
    <div className="h-full max-h-screen overflow-y-auto space-y-6 pr-2">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestion des commandes</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par nom, email, produit, ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-80"
          />
        </div>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">En attente ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="processed">Historique ({processedOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <OrdersTable orders={pendingOrders} onProcessOrder={(id) => mutation.mutate(id)} />
        </TabsContent>
        <TabsContent value="processed">
          <OrdersTable orders={processedOrders} isHistory={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface OrdersTableProps {
  orders: (Order & { user_email?: string | null })[];
  isHistory?: boolean;
  onProcessOrder?: (id: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, isHistory = false, onProcessOrder }) => {
  if (orders.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">Aucune commande trouvée.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Objet</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Date</TableHead>
            {!isHistory && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {order.profiles?.first_name || order.profiles?.last_name 
                      ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim()
                      : order.profiles?.username || 'Utilisateur inconnu'
                    }
                  </div>
                  {order.profiles?.username && (order.profiles?.first_name || order.profiles?.last_name) && (
                    <div className="text-sm text-muted-foreground">@{order.profiles.username}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>{order.user_email || 'Email non disponible'}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {order.profiles?.city && order.profiles?.country && (
                    <div>
                      {order.profiles.city}, {order.profiles.country}
                    </div>
                  )}
                  {!order.profiles?.city && !order.profiles?.country && (
                    <span className="text-muted-foreground">Adresse non renseignée</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{order.item_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{order.price} Tensens</Badge>
              </TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              {!isHistory && (
                <TableCell>
                  <Button size="sm" onClick={() => onProcessOrder?.(order.id)}>
                    Marquer comme traité
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
