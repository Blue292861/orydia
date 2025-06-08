
import React, { useState } from 'react';
import { ShopItem } from '@/types/ShopItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShopItemForm } from '@/components/ShopItemForm';
import { Plus, Pencil, Trash2, Coins } from 'lucide-react';

interface ShopAdminProps {
  shopItems: ShopItem[];
  onAddItem: (item: ShopItem) => void;
  onUpdateItem: (item: ShopItem) => void;
  onDeleteItem: (id: string) => void;
}

export const ShopAdmin: React.FC<ShopAdminProps> = ({ 
  shopItems, 
  onAddItem,
  onUpdateItem,
  onDeleteItem
}) => {
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
      onUpdateItem(itemData);
    } else {
      onAddItem(itemData);
    }
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shop item?')) {
      onDeleteItem(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Shop Management</h2>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Shop Item
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
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-primary" />
                <span className="font-medium">{item.price} points</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(item)}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {shopItems.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No shop items yet. Add your first item!</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Shop Item' : 'Add New Shop Item'}</DialogTitle>
          </DialogHeader>
          <ShopItemForm 
            initialItem={editingItem || {
              id: '',
              name: '',
              description: '',
              price: 0,
              imageUrl: '',
              category: ''
            }}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
