import React from 'react';
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
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const fetchOrders = async (): Promise<Order[]> => {
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
    throw new Error(ordersError.message);
  }
  if (!ordersData) return [];

  const userIds = [...new Set(ordersData.map((o) => o.user_id))];
  
  if (userIds.length === 0) {
    return ordersData as Order[];
  }

  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    // Gracefully handle profile fetch error by returning orders without profile info
    return ordersData.map((order) => ({
      ...order,
      profiles: null,
    })) as Order[];
  }

  const profilesMap = new Map(
    profilesData.map((p) => [p.id, { username: p.username, avatar_url: p.avatar_url }])
  );

  const ordersWithProfiles = ordersData.map((order) => ({
    ...order,
    profiles: profilesMap.get(order.user_id) || null,
  }));

  return ordersWithProfiles as Order[];
};

export const OrdersAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'], 
    queryFn: fetchOrders
  });

  const mutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'processed' })
        .eq('id', orderId);

      if (error) {
        throw new Error(error.message);
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

  const pendingOrders = orders?.filter((o) => o.status === 'pending') || [];
  const processedOrders = orders?.filter((o) => o.status === 'processed') || [];

  if (isLoading) return <div>Chargement des commandes...</div>;
  if (error) return <div>Erreur lors du chargement des commandes: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Gestion des commandes</h2>
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
  orders: Order[];
  isHistory?: boolean;
  onProcessOrder?: (id: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, isHistory = false, onProcessOrder }) => {
  if (orders.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">Aucune commande ici.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Objet</TableHead>
          <TableHead>Prix</TableHead>
          <TableHead>Date</TableHead>
          {!isHistory && <TableHead>Action</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.profiles?.username || 'Utilisateur inconnu'}</TableCell>
            <TableCell>{order.item_name}</TableCell>
            <TableCell>
                <Badge variant="outline">{order.price} Tensens</Badge>
            </TableCell>
            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
            {!isHistory && (
              <TableCell>
                <Button size="sm" onClick={() => onProcessOrder?.(order.id)}>Marquer comme traité</Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
