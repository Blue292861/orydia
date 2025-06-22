
import React, { useState } from 'react';
import { Achievement } from '@/types/UserStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Trophy, Crown } from 'lucide-react';

interface AchievementAdminProps {
  achievements: Achievement[];
  onAddAchievement: (achievement: Achievement) => void;
  onUpdateAchievement: (achievement: Achievement) => void;
  onDeleteAchievement: (id: string) => void;
}

export const AchievementAdmin: React.FC<AchievementAdminProps> = ({ 
  achievements, 
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
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

  const handleOpenAdd = () => {
    setEditingAchievement(null);
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
    setShowDialog(true);
  };

  const handleOpenEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData(achievement);
    setShowDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const achievementData = {
      ...formData,
      id: editingAchievement ? editingAchievement.id : Date.now().toString(),
      premiumMonths: formData.premiumMonths || 0
    };

    if (editingAchievement) {
      onUpdateAchievement(achievementData);
    } else {
      onAddAchievement(achievementData);
    }
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      onDeleteAchievement(id);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      case 'ultra-legendary': return 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-amber-500" />
          Achievement Management
        </h2>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Achievement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{achievement.icon}</span>
                  <CardTitle className="text-lg">{achievement.name}</CardTitle>
                </div>
                <Badge className={`${getRarityColor(achievement.rarity)} text-white border-0`}>
                  {achievement.rarity === 'ultra-legendary' ? (
                    <span className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Ultra-Legendary
                    </span>
                  ) : (
                    achievement.rarity
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-primary">{achievement.points} points</span>
                </div>
                {achievement.premiumMonths && achievement.premiumMonths > 0 && (
                  <div className="flex items-center gap-1 text-sm text-amber-600">
                    <Crown className="h-4 w-4" />
                    <span>{achievement.premiumMonths} mois premium offert{achievement.premiumMonths > 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(achievement)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(achievement.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No achievements yet. Add your first achievement!</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
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
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAchievement ? 'Update' : 'Create'} Achievement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
