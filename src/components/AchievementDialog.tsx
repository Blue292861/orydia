
import React, { useState, useEffect } from 'react';
import { Achievement } from '@/types/UserStats';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAchievement: Achievement | null;
  onSubmit: (achievement: Achievement) => void;
}

export const AchievementDialog: React.FC<AchievementDialogProps> = ({
  open,
  onOpenChange,
  editingAchievement,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Achievement>({
    id: '',
    name: '',
    description: '',
    points: 0,
    unlocked: false,
    icon: '🏆',
    rarity: 'common',
    premiumMonths: 0
  });

  useEffect(() => {
    if (editingAchievement) {
      setFormData(editingAchievement);
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        points: 0,
        unlocked: false,
        icon: '🏆',
        rarity: 'common',
        premiumMonths: 0
      });
    }
  }, [editingAchievement, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const achievementData = {
      ...formData,
      id: editingAchievement ? editingAchievement.id : Date.now().toString(),
      premiumMonths: formData.premiumMonths || 0
    };

    onSubmit(achievementData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="icon">Icon (Emoji)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
              placeholder="🏆"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="points">Points Reward</Label>
            <Input
              id="points"
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="premiumMonths">Premium Months Reward (optional)</Label>
            <Input
              id="premiumMonths"
              type="number"
              min="0"
              value={formData.premiumMonths || 0}
              onChange={(e) => setFormData({...formData, premiumMonths: parseInt(e.target.value) || 0})}
              placeholder="0"
            />
          </div>
          
          <div>
            <Label htmlFor="rarity">Rarity</Label>
            <Select value={formData.rarity} onValueChange={(value: any) => setFormData({...formData, rarity: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="ultra-legendary">Ultra-Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAchievement ? 'Update' : 'Create'} Achievement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
