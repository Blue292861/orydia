import React, { useState, useEffect } from 'react';
import { SkillPath, Skill, BonusType, BonusConfig, getDayNames } from '@/types/Skill';
import { LITERARY_GENRES } from '@/constants/genres';
import { 
  getAllSkillPathsWithSkills, 
  createSkillPath, 
  updateSkillPath, 
  deleteSkillPath,
  createSkill,
  updateSkill,
  deleteSkill
} from '@/services/skillService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, TreeDeciduous } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

export const SkillTreeAdmin: React.FC = () => {
  const [paths, setPaths] = useState<SkillPath[]>([]);
  const [rewardTypes, setRewardTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPathDialog, setShowPathDialog] = useState(false);
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [editingPath, setEditingPath] = useState<SkillPath | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [currentPathId, setCurrentPathId] = useState<string | null>(null);

  // Form states for path
  const [pathForm, setPathForm] = useState({ name: '', description: '', icon: '🌳', position: 0, is_active: true });

  // Form states for skill
  const [skillForm, setSkillForm] = useState({
    name: '', description: '', icon: '⭐', position: 1, skill_point_cost: 1,
    bonus_type: 'day_orydors' as BonusType,
    days: [] as number[], percentage: 1, genres: [] as string[], reward_type_id: '', is_active: true
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pathsData, { data: rtData }] = await Promise.all([
        getAllSkillPathsWithSkills(),
        supabase.from('reward_types').select('id, name').order('name')
      ]);
      setPaths(pathsData);
      setRewardTypes(rtData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSavePath = async () => {
    try {
      if (editingPath) {
        await updateSkillPath(editingPath.id, pathForm);
        toast({ title: 'Chemin mis à jour' });
      } else {
        await createSkillPath(pathForm);
        toast({ title: 'Chemin créé' });
      }
      setShowPathDialog(false);
      loadData();
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleDeletePath = async (id: string) => {
    if (!confirm('Supprimer ce chemin et toutes ses compétences ?')) return;
    try {
      await deleteSkillPath(id);
      toast({ title: 'Chemin supprimé' });
      loadData();
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleSaveSkill = async () => {
    if (!currentPathId) return;
    try {
      let bonusConfig: BonusConfig;
      if (skillForm.bonus_type === 'day_orydors') {
        bonusConfig = { days: skillForm.days, percentage: skillForm.percentage };
      } else if (skillForm.bonus_type === 'genre_orydors') {
        bonusConfig = { genres: skillForm.genres, percentage: skillForm.percentage };
      } else if (skillForm.bonus_type === 'xp_boost') {
        bonusConfig = { percentage: skillForm.percentage };
      } else {
        bonusConfig = { reward_type_id: skillForm.reward_type_id, percentage: skillForm.percentage };
      }

      const skillData = {
        path_id: currentPathId,
        name: skillForm.name,
        description: skillForm.description,
        icon: skillForm.icon,
        position: skillForm.position,
        skill_point_cost: skillForm.skill_point_cost,
        bonus_type: skillForm.bonus_type,
        bonus_config: bonusConfig,
        is_active: skillForm.is_active
      };

      if (editingSkill) {
        await updateSkill(editingSkill.id, skillData);
        toast({ title: 'Compétence mise à jour' });
      } else {
        await createSkill(skillData);
        toast({ title: 'Compétence créée' });
      }
      setShowSkillDialog(false);
      loadData();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Supprimer cette compétence ?')) return;
    try {
      await deleteSkill(id);
      toast({ title: 'Compétence supprimée' });
      loadData();
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const openAddPath = () => {
    setEditingPath(null);
    setPathForm({ name: '', description: '', icon: '🌳', position: paths.length, is_active: true });
    setShowPathDialog(true);
  };

  const openEditPath = (path: SkillPath) => {
    setEditingPath(path);
    setPathForm({ name: path.name, description: path.description || '', icon: path.icon, position: path.position, is_active: path.is_active });
    setShowPathDialog(true);
  };

  const openAddSkill = (pathId: string, skills: Skill[]) => {
    setEditingSkill(null);
    setCurrentPathId(pathId);
    const maxPos = skills.length > 0 ? Math.max(...skills.map(s => s.position)) : 0;
    setSkillForm({ name: '', description: '', icon: '⭐', position: maxPos + 1, skill_point_cost: 1, bonus_type: 'day_orydors', days: [], percentage: 1, genres: [], reward_type_id: '', is_active: true });
    setShowSkillDialog(true);
  };

  const openEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setCurrentPathId(skill.path_id);
    const cfg = skill.bonus_config as any;
    setSkillForm({
      name: skill.name, description: skill.description || '', icon: skill.icon, position: skill.position,
      skill_point_cost: skill.skill_point_cost, bonus_type: skill.bonus_type,
      days: cfg.days || [], percentage: cfg.percentage || 1, genres: cfg.genres || (cfg.genre ? [cfg.genre] : []), reward_type_id: cfg.reward_type_id || '',
      is_active: skill.is_active
    });
    setShowSkillDialog(true);
  };

  if (isLoading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-2"><TreeDeciduous className="w-6 h-6" /> Arbre de Compétences</h3>
        <Button onClick={openAddPath}><Plus className="w-4 h-4 mr-2" /> Nouveau Chemin</Button>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {paths.map(path => (
          <AccordionItem key={path.id} value={path.id} className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{path.icon}</span>
                <span className="font-medium">{path.name}</span>
                <Badge variant={path.is_active ? 'default' : 'secondary'}>{path.is_active ? 'Actif' : 'Inactif'}</Badge>
                <Badge variant="outline">{path.skills?.length || 0} compétences</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => openEditPath(path)}><Pencil className="w-4 h-4 mr-1" /> Modifier</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeletePath(path.id)}><Trash2 className="w-4 h-4 mr-1" /> Supprimer</Button>
                <Button size="sm" onClick={() => openAddSkill(path.id, path.skills || [])}><Plus className="w-4 h-4 mr-1" /> Ajouter Compétence</Button>
              </div>
              <div className="space-y-2">
                {(path.skills || []).sort((a, b) => a.position - b.position).map(skill => (
                  <Card key={skill.id} className="bg-muted/50">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{skill.icon}</span>
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-xs text-muted-foreground">Position {skill.position} • {skill.skill_point_cost} pts • {skill.bonus_type}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditSkill(skill)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSkill(skill.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Path Dialog */}
      <Dialog open={showPathDialog} onOpenChange={setShowPathDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingPath ? 'Modifier' : 'Nouveau'} Chemin</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nom</Label><Input value={pathForm.name} onChange={e => setPathForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={pathForm.description} onChange={e => setPathForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>Icône</Label><Input value={pathForm.icon} onChange={e => setPathForm(p => ({ ...p, icon: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={pathForm.is_active} onCheckedChange={c => setPathForm(p => ({ ...p, is_active: c }))} /><Label>Actif</Label></div>
          </div>
          <DialogFooter><Button onClick={handleSavePath}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skill Dialog */}
      <Dialog open={showSkillDialog} onOpenChange={setShowSkillDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingSkill ? 'Modifier' : 'Nouvelle'} Compétence</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nom</Label><Input value={skillForm.name} onChange={e => setSkillForm(s => ({ ...s, name: e.target.value }))} /></div>
              <div><Label>Icône</Label><Input value={skillForm.icon} onChange={e => setSkillForm(s => ({ ...s, icon: e.target.value }))} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={skillForm.description} onChange={e => setSkillForm(s => ({ ...s, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Position</Label><Input type="number" value={skillForm.position} onChange={e => setSkillForm(s => ({ ...s, position: +e.target.value }))} /></div>
              <div><Label>Coût (pts)</Label><Input type="number" value={skillForm.skill_point_cost} onChange={e => setSkillForm(s => ({ ...s, skill_point_cost: +e.target.value }))} /></div>
            </div>
            <div><Label>Type de Bonus</Label>
              <Select value={skillForm.bonus_type} onValueChange={v => setSkillForm(s => ({ ...s, bonus_type: v as BonusType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day_orydors">Bonus Orydors par jour</SelectItem>
                  <SelectItem value="genre_orydors">Bonus Orydors par genre(s)</SelectItem>
                  <SelectItem value="xp_boost">Bonus XP global</SelectItem>
                  <SelectItem value="chest_drop">Bonus drop coffre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {skillForm.bonus_type === 'day_orydors' && (
              <div><Label>Jours</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getDayNames().map((day, i) => (
                    <label key={i} className="flex items-center gap-1 text-sm">
                      <Checkbox checked={skillForm.days.includes(i)} onCheckedChange={c => setSkillForm(s => ({ ...s, days: c ? [...s.days, i] : s.days.filter(d => d !== i) }))} />
                      {day.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {skillForm.bonus_type === 'genre_orydors' && (
              <div><Label>Genres (sélection multiple)</Label>
                <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {LITERARY_GENRES.map(g => (
                    <label key={g} className="flex items-center gap-1 text-sm">
                      <Checkbox 
                        checked={skillForm.genres.includes(g)} 
                        onCheckedChange={c => setSkillForm(s => ({ 
                          ...s, 
                          genres: c ? [...s.genres, g] : s.genres.filter(genre => genre !== g) 
                        }))} 
                      />
                      {g}
                    </label>
                  ))}
                </div>
                {skillForm.genres.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{skillForm.genres.length} genre(s) sélectionné(s)</p>
                )}
              </div>
            )}
            {skillForm.bonus_type === 'chest_drop' && (
              <div><Label>Item</Label>
                <Select value={skillForm.reward_type_id} onValueChange={v => setSkillForm(s => ({ ...s, reward_type_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un item" /></SelectTrigger>
                  <SelectContent>{rewardTypes.map(rt => <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div><Label>Pourcentage bonus</Label><Input type="number" value={skillForm.percentage} onChange={e => setSkillForm(s => ({ ...s, percentage: +e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={skillForm.is_active} onCheckedChange={c => setSkillForm(s => ({ ...s, is_active: c }))} /><Label>Actif</Label></div>
          </div>
          <DialogFooter><Button onClick={handleSaveSkill}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
