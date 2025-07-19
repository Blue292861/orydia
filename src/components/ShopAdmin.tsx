
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShopItemForm } from '@/components/shop/ShopItemForm';
import { Plus, Pencil, Trash2, Coins, User } from 'lucide-react';
import { useShopItems } from '@/hooks/useShopItems';
import { ShopItem } from '@/types/ShopItem';
import { useResponsive } from '@/hooks/useResponsive';

export const ShopAdmin: React.FC = () => {
  const { shopItems, loading, addShopItem, updateShopItem, deleteShopItem } = useShopItems();
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const { isMobile, isTablet } = useResponsive();

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
    <div className="h-full max-h-screen overflow-y-auto space-y-6 pr-2">
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
        <h2 className={`font-bold ${isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-3xl'}`}>
          Gestion de la boutique
        </h2>
        <Button 
          onClick={handleOpenAdd} 
          className={`flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`}
        >
          <Plus className="h-4 w-4" /> 
          {isMobile ? 'Ajouter' : 'Ajouter un objet'}
        </Button>
      </div>

      <div className={`grid gap-4 ${
        isMobile 
          ? 'grid-cols-1' 
          : isTablet 
            ? 'grid-cols-1 sm:grid-cols-2' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {shopItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className={`aspect-square overflow-hidden ${isMobile ? 'h-48' : ''}`}>
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover" 
              />
            </div>
            <CardHeader className={`${isMobile ? 'pb-2 px-4 pt-4' : 'pb-2'}`}>
              <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} line-clamp-2`}>
                {item.name}
              </CardTitle>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                {item.category}
              </p>
            </CardHeader>
            <CardContent className={`space-y-3 ${isMobile ? 'px-4 pb-4' : ''}`}>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} line-clamp-2`}>
                {item.description}
              </p>
              <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                <User className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-medium truncate">{item.seller}</span>
              </div>
              <div className={`flex items-center gap-1 ${isMobile ? 'text-sm' : ''}`}>
                <Coins className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-medium">{item.price} points</span>
              </div>
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-end gap-2'}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOpenEdit(item)}
                  className={isMobile ? 'w-full' : ''}
                >
                  <Pencil className="h-4 w-4 mr-1" /> Modifier
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(item.id)}
                  className={isMobile ? 'w-full' : ''}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {shopItems.length === 0 && (
        <div className={`text-center py-12 border rounded-lg ${isMobile ? 'px-4' : ''}`}>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            Aucun article dans la boutique pour le moment. Ajoutez votre premier article !
          </p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw]' : 'sm:max-w-[525px]'}`}>
          <DialogHeader>
            <DialogTitle className={isMobile ? 'text-lg' : ''}>
              {editingItem ? "Modifier l'objet" : 'Ajouter un nouvel objet'}
            </DialogTitle>
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
