// Service for Skill Tree operations
import { supabase } from '@/integrations/supabase/client';
import { 
  SkillPath, 
  Skill, 
  UserSkill, 
  UserSkillStats, 
  ActiveSkillBonus, 
  UnlockSkillResult,
  BonusConfig,
  BonusType
} from '@/types/Skill';
import { Json } from '@/integrations/supabase/types';

// Helper to convert DB skill to typed Skill
function mapDbSkillToSkill(dbSkill: any): Skill {
  return {
    ...dbSkill,
    bonus_type: dbSkill.bonus_type as BonusType,
    bonus_config: dbSkill.bonus_config as unknown as BonusConfig
  };
}

// ========== SKILL PATHS ==========

export async function getSkillPaths(): Promise<SkillPath[]> {
  const { data, error } = await supabase
    .from('skill_paths')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getAllSkillPaths(): Promise<SkillPath[]> {
  const { data, error } = await supabase
    .from('skill_paths')
    .select('*')
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createSkillPath(path: Partial<SkillPath>): Promise<SkillPath> {
  const { data, error } = await supabase
    .from('skill_paths')
    .insert({
      name: path.name!,
      description: path.description,
      icon: path.icon || '🌳',
      position: path.position || 0,
      is_active: path.is_active ?? true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSkillPath(id: string, updates: Partial<SkillPath>): Promise<SkillPath> {
  const { data, error } = await supabase
    .from('skill_paths')
    .update({
      name: updates.name,
      description: updates.description,
      icon: updates.icon,
      position: updates.position,
      is_active: updates.is_active
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSkillPath(id: string): Promise<void> {
  const { error } = await supabase
    .from('skill_paths')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========== SKILLS ==========

export async function getSkillsByPath(pathId: string): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('path_id', pathId)
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapDbSkillToSkill);
}

export async function getAllSkills(): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('path_id')
    .order('position', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapDbSkillToSkill);
}

export async function createSkill(skill: Partial<Skill>): Promise<Skill> {
  const { data, error } = await supabase
    .from('skills')
    .insert({
      path_id: skill.path_id!,
      name: skill.name!,
      description: skill.description,
      icon: skill.icon || '⭐',
      position: skill.position || 1,
      skill_point_cost: skill.skill_point_cost || 1,
      bonus_type: skill.bonus_type!,
      bonus_config: skill.bonus_config as unknown as Json,
      is_active: skill.is_active ?? true
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbSkillToSkill(data);
}

export async function updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.icon !== undefined) updateData.icon = updates.icon;
  if (updates.position !== undefined) updateData.position = updates.position;
  if (updates.skill_point_cost !== undefined) updateData.skill_point_cost = updates.skill_point_cost;
  if (updates.bonus_type !== undefined) updateData.bonus_type = updates.bonus_type;
  if (updates.bonus_config !== undefined) updateData.bonus_config = updates.bonus_config as unknown as Json;
  if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

  const { data, error } = await supabase
    .from('skills')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDbSkillToSkill(data);
}

export async function deleteSkill(id: string): Promise<void> {
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========== USER SKILLS ==========

export async function getUserSkills(userId: string): Promise<UserSkill[]> {
  const { data, error } = await supabase
    .from('user_skills')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function getUserSkillStats(userId: string): Promise<UserSkillStats> {
  const { data, error } = await supabase
    .rpc('get_user_skill_stats', { p_user_id: userId });

  if (error) throw error;
  return data as unknown as UserSkillStats;
}

export async function unlockSkill(userId: string, skillId: string): Promise<UnlockSkillResult> {
  const { data, error } = await supabase
    .rpc('unlock_skill', { 
      p_user_id: userId, 
      p_skill_id: skillId 
    });

  if (error) throw error;
  return data as unknown as UnlockSkillResult;
}

export async function getActiveSkillBonuses(userId: string): Promise<ActiveSkillBonus[]> {
  const { data, error } = await supabase
    .rpc('get_user_active_skill_bonuses', { p_user_id: userId });

  if (error) throw error;
  return (data || []).map((bonus: any) => ({
    ...bonus,
    bonus_type: bonus.bonus_type as BonusType,
    bonus_config: bonus.bonus_config as unknown as BonusConfig
  }));
}

// ========== SKILL PATHS WITH SKILLS ==========

export async function getSkillPathsWithSkills(): Promise<SkillPath[]> {
  const paths = await getSkillPaths();
  const skills = await getAllSkills();

  return paths.map(path => ({
    ...path,
    skills: skills.filter(s => s.path_id === path.id && s.is_active)
  }));
}

export async function getAllSkillPathsWithSkills(): Promise<SkillPath[]> {
  const paths = await getAllSkillPaths();
  const skills = await getAllSkills();

  return paths.map(path => ({
    ...path,
    skills: skills.filter(s => s.path_id === path.id)
  }));
}
