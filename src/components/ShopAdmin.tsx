
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShopItemForm } from '@/components/ShopItemForm';
import { Plus, Pencil, Trash2, Coins, User } from 'lucide-react';
import { useShopItems } from '@/hooks/useShopItems';
import { ShopItem } from '@/types/ShopItem';

export const ShopAdmin: React.FC = () => {
  const { shopItems, loading, addShopItem, updateShopItem, deleteShopItem } = useShopItems();
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setShowDialog(true);
  };

  const handleOpenEdit = (item: ShopItem) => {
    setEditingItem(item);
    setShowDialog(true);
  };

  const handleSubmit = (itemData: ShopItem) => {
    if (editingItem) {
      updateShopItem(itemData);
    } else {
      addShopItem(itemData);
    }
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      deleteShopItem(id);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestion de la boutique</h2>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Ajouter un objet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover" 
              />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{item.category}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{item.description}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{item.seller}</span>
              </div>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-primary" />
                <span className="font-medium">{item.price} points</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(item)}>
                  <Pencil className="h-4 w-4 mr-1" /> Modifier
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {shopItems.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">Aucun article dans la boutique pour le moment. Ajoutez votre premier article !</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier l'objet" : 'Ajouter un nouvel objet'}</DialogTitle>
          </DialogHeader>
          <ShopItemForm 
            initialItem={editingItem || {
              id: '',
              name: '',
              description: '',
              content: '',
              price: 0,
              imageUrl: '',
              category: '',
              seller: ''
            }}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
