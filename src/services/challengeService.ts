import { supabase } from "@/integrations/supabase/client";
import { Challenge, ChallengeObjective, UserChallengeStatus, UserChallengeProgress, ItemRewardConfig } from "@/types/Challenge";

// Mapper les données de la DB vers le type Challenge
function mapChallenge(data: any, objectives: ChallengeObjective[] = []): Challenge {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    icon: data.icon || '🎯',
    startDate: new Date(data.start_date),
    endDate: new Date(data.end_date),
    isActive: data.is_active,
    orydorsReward: data.orydors_reward || 0,
    xpReward: data.xp_reward || 0,
    itemRewards: (data.item_rewards as ItemRewardConfig[]) || [],
    premiumMonthsReward: data.premium_months_reward || 0,
    isGuildChallenge: data.is_guild_challenge || false,
    objectives,
    createdAt: new Date(data.created_at),
  };
}

function mapObjective(data: any): ChallengeObjective {
  return {
    id: data.id,
    challengeId: data.challenge_id,
    objectiveType: data.objective_type,
    objectiveName: data.objective_name,
    targetCount: data.target_count || 1,
    targetBookId: data.target_book_id,
    targetGenre: data.target_genre,
    targetRewardTypeId: data.target_reward_type_id,
    position: data.position || 0,
    targetBook: data.books ? {
      id: data.books.id,
      title: data.books.title,
      coverUrl: data.books.cover_url,
    } : undefined,
    targetRewardType: data.reward_types ? {
      id: data.reward_types.id,
      name: data.reward_types.name,
      imageUrl: data.reward_types.image_url,
    } : undefined,
  };
}

// Récupérer les défis actifs
export async function getActiveChallenges(): Promise<Challenge[]> {
  const now = new Date().toISOString();
  
  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching active challenges:', error);
    return [];
  }

  // Récupérer les objectifs pour chaque défi
  const challengeIds = challenges?.map(c => c.id) || [];
  
  if (challengeIds.length === 0) return [];

  const { data: objectives, error: objError } = await supabase
    .from('challenge_objectives')
    .select(`
      *,
      books (id, title, cover_url),
      reward_types (id, name, image_url)
    `)
    .in('challenge_id', challengeIds)
    .order('position', { ascending: true });

  if (objError) {
    console.error('Error fetching objectives:', objError);
  }

  return (challenges || []).map(c => {
    const challengeObjectives = (objectives || [])
      .filter(o => o.challenge_id === c.id)
      .map(mapObjective);
    return mapChallenge(c, challengeObjectives);
  });
}

// Récupérer tous les défis (admin)
export async function getAllChallenges(): Promise<Challenge[]> {
  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all challenges:', error);
    return [];
  }

  const challengeIds = challenges?.map(c => c.id) || [];
  
  if (challengeIds.length === 0) return [];

  const { data: objectives } = await supabase
    .from('challenge_objectives')
    .select(`
      *,
      books (id, title, cover_url),
      reward_types (id, name, image_url)
    `)
    .in('challenge_id', challengeIds)
    .order('position', { ascending: true });

  return (challenges || []).map(c => {
    const challengeObjectives = (objectives || [])
      .filter(o => o.challenge_id === c.id)
      .map(mapObjective);
    return mapChallenge(c, challengeObjectives);
  });
}

// Récupérer la progression d'un utilisateur pour les défis actifs
export async function getUserChallengesWithProgress(userId: string): Promise<UserChallengeStatus[]> {
  const challenges = await getActiveChallenges();
  
  if (challenges.length === 0) return [];

  // Récupérer la progression de l'utilisateur
  const { data: progressData } = await supabase
    .from('user_challenge_progress')
    .select('*')
    .eq('user_id', userId);

  // Récupérer les complétions
  const { data: completions } = await supabase
    .from('user_challenge_completions')
    .select('*')
    .eq('user_id', userId);

  return challenges.map(challenge => {
    const progress: UserChallengeProgress[] = challenge.objectives.map(obj => {
      const userProgress = progressData?.find(p => p.objective_id === obj.id);
      return {
        objectiveId: obj.id,
        currentProgress: userProgress?.current_progress || 0,
        targetCount: obj.targetCount,
        isCompleted: userProgress?.is_completed || false,
        completedAt: userProgress?.completed_at ? new Date(userProgress.completed_at) : undefined,
      };
    });

    const completedObjectives = progress.filter(p => p.isCompleted).length;
    const totalObjectives = challenge.objectives.length;
    const overallProgress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;
    
    const completion = completions?.find(c => c.challenge_id === challenge.id);

    return {
      challenge,
      progress,
      overallProgress,
      isFullyCompleted: completedObjectives === totalObjectives && totalObjectives > 0,
      rewardsClaimed: completion?.rewards_claimed || false,
    };
  });
}

// Mettre à jour la progression d'un objectif
export async function updateChallengeProgress(
  userId: string,
  objectiveId: string,
  challengeId: string,
  increment: number = 1
): Promise<void> {
  // Récupérer l'objectif pour connaître la cible
  const { data: objective } = await supabase
    .from('challenge_objectives')
    .select('target_count')
    .eq('id', objectiveId)
    .single();

  if (!objective) return;

  // Upsert la progression
  const { data: existing } = await supabase
    .from('user_challenge_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('objective_id', objectiveId)
    .single();

  const newProgress = (existing?.current_progress || 0) + increment;
  const isCompleted = newProgress >= objective.target_count;

  if (existing) {
    await supabase
      .from('user_challenge_progress')
      .update({
        current_progress: Math.min(newProgress, objective.target_count),
        is_completed: isCompleted,
        completed_at: isCompleted && !existing.is_completed ? new Date().toISOString() : existing.completed_at,
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('user_challenge_progress')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        objective_id: objectiveId,
        current_progress: Math.min(newProgress, objective.target_count),
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      });
  }
}

// Vérifier et mettre à jour la progression quand un livre est terminé
export async function updateProgressOnBookCompletion(
  userId: string,
  bookId: string,
  bookGenres: string[]
): Promise<void> {
  const challenges = await getActiveChallenges();
  
  for (const challenge of challenges) {
    for (const objective of challenge.objectives) {
      // Objectif: lire un livre spécifique
      if (objective.objectiveType === 'read_book' && objective.targetBookId === bookId) {
        await updateChallengeProgress(userId, objective.id, challenge.id, 1);
      }
      
      // Objectif: lire des livres d'un genre spécifique
      if (objective.objectiveType === 'read_genre' && objective.targetGenre) {
        if (bookGenres.includes(objective.targetGenre)) {
          await updateChallengeProgress(userId, objective.id, challenge.id, 1);
        }
      }
      
      // Objectif: lire n'importe quel livre
      if (objective.objectiveType === 'read_any_books') {
        await updateChallengeProgress(userId, objective.id, challenge.id, 1);
      }
      
      // Objectif: lire un livre d'une saga (au choix parmi plusieurs)
      if (objective.objectiveType === 'read_saga_book' && objective.targetBookIds) {
        if (objective.targetBookIds.includes(bookId)) {
          await updateChallengeProgress(userId, objective.id, challenge.id, 1);
        }
      }
    }
  }
}

// Mettre à jour la progression d'un défi de guilde
export async function updateGuildChallengeProgress(
  guildId: string,
  objectiveId: string,
  increment: number = 1
): Promise<void> {
  // Récupérer l'objectif pour connaître la cible
  const { data: objective } = await supabase
    .from('challenge_objectives')
    .select('target_count')
    .eq('id', objectiveId)
    .single();

  if (!objective) return;

  // Upsert la progression de guilde
  const { data: existing } = await supabase
    .from('guild_challenge_progress')
    .select('*')
    .eq('guild_id', guildId)
    .eq('objective_id', objectiveId)
    .single();

  const newProgress = (existing?.current_progress || 0) + increment;
  const isCompleted = newProgress >= objective.target_count;

  if (existing) {
    await supabase
      .from('guild_challenge_progress')
      .update({
        current_progress: Math.min(newProgress, objective.target_count),
        is_completed: isCompleted,
        completed_at: isCompleted && !existing.is_completed ? new Date().toISOString() : existing.completed_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('guild_challenge_progress')
      .insert({
        guild_id: guildId,
        objective_id: objectiveId,
        current_progress: Math.min(newProgress, objective.target_count),
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      });
  }
}

// Récupérer la guilde d'un utilisateur
async function getUserGuildId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('guild_members')
    .select('guild_id')
    .eq('user_id', userId)
    .single();
  
  return data?.guild_id || null;
}

// Vérifier et mettre à jour la progression quand un chapitre est terminé
export async function updateProgressOnChapterCompletion(
  userId: string,
  bookId: string,
  chapterId: string,
  bookGenres: string[]
): Promise<void> {
  const challenges = await getActiveChallenges();
  const userGuildId = await getUserGuildId(userId);
  
  for (const challenge of challenges) {
    for (const objective of challenge.objectives) {
      // Pour les défis de guilde, on met à jour la progression de la guilde
      if (challenge.isGuildChallenge && userGuildId) {
        // Objectif: lire X chapitres d'un livre spécifique
        if (objective.objectiveType === 'read_chapters_book' && objective.targetBookId === bookId) {
          await updateGuildChallengeProgress(userGuildId, objective.id, 1);
        }
        
        // Objectif: lire X chapitres de livres d'un genre
        if (objective.objectiveType === 'read_chapters_genre' && objective.targetGenre) {
          if (bookGenres.includes(objective.targetGenre)) {
            await updateGuildChallengeProgress(userGuildId, objective.id, 1);
          }
        }
        
        // Objectif: lire X chapitres parmi une sélection de livres
        if (objective.objectiveType === 'read_chapters_selection' && objective.targetBookIds) {
          if (objective.targetBookIds.includes(bookId)) {
            await updateGuildChallengeProgress(userGuildId, objective.id, 1);
          }
        }
      } else {
        // Défis individuels
        // Objectif: lire X chapitres d'un livre spécifique
        if (objective.objectiveType === 'read_chapters_book' && objective.targetBookId === bookId) {
          await updateChallengeProgress(userId, objective.id, challenge.id, 1);
        }
        
        // Objectif: lire X chapitres de livres d'un genre
        if (objective.objectiveType === 'read_chapters_genre' && objective.targetGenre) {
          if (bookGenres.includes(objective.targetGenre)) {
            await updateChallengeProgress(userId, objective.id, challenge.id, 1);
          }
        }
        
        // Objectif: lire X chapitres parmi une sélection de livres
        if (objective.objectiveType === 'read_chapters_selection' && objective.targetBookIds) {
          if (objective.targetBookIds.includes(bookId)) {
            await updateChallengeProgress(userId, objective.id, challenge.id, 1);
          }
        }
      }
    }
  }
}

// Vérifier et mettre à jour la progression quand un item est obtenu
export async function updateProgressOnItemCollected(
  userId: string,
  rewardTypeId: string
): Promise<void> {
  const challenges = await getActiveChallenges();
  
  for (const challenge of challenges) {
    for (const objective of challenge.objectives) {
      if (objective.objectiveType === 'collect_item' && objective.targetRewardTypeId === rewardTypeId) {
        await updateChallengeProgress(userId, objective.id, challenge.id, 1);
      }
    }
  }
}

// Réclamer les récompenses d'un défi
export async function claimChallengeRewards(
  userId: string,
  challengeId: string
): Promise<{ success: boolean; error?: string }> {
  // Vérifier que tous les objectifs sont complétés
  const challenges = await getUserChallengesWithProgress(userId);
  const challengeStatus = challenges.find(c => c.challenge.id === challengeId);

  if (!challengeStatus) {
    return { success: false, error: 'Défi non trouvé' };
  }

  if (!challengeStatus.isFullyCompleted) {
    return { success: false, error: 'Tous les objectifs ne sont pas complétés' };
  }

  if (challengeStatus.rewardsClaimed) {
    return { success: false, error: 'Récompenses déjà réclamées' };
  }

  const challenge = challengeStatus.challenge;

  // Ajouter les Orydors
  if (challenge.orydorsReward > 0) {
    const { data: levelInfo } = await supabase
      .from('user_level_info')
      .select('total_points')
      .eq('user_id', userId)
      .single();

    await supabase
      .from('user_level_info')
      .update({ total_points: (levelInfo?.total_points || 0) + challenge.orydorsReward })
      .eq('user_id', userId);

    await supabase.from('point_transactions').insert({
      user_id: userId,
      points: challenge.orydorsReward,
      transaction_type: 'challenge_reward',
      description: `Récompense du défi: ${challenge.name}`,
      reference_id: challengeId,
    });
  }

  // Ajouter l'XP
  if (challenge.xpReward > 0) {
    const { data: levelInfo } = await supabase
      .from('user_level_info')
      .select('experience_points')
      .eq('user_id', userId)
      .single();

    await supabase
      .from('user_level_info')
      .update({ experience_points: (levelInfo?.experience_points || 0) + challenge.xpReward })
      .eq('user_id', userId);
  }

  // Ajouter les items
  for (const itemReward of challenge.itemRewards) {
    const { data: existing } = await supabase
      .from('user_inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('reward_type_id', itemReward.rewardTypeId)
      .single();

    if (existing) {
      await supabase
        .from('user_inventory')
        .update({ quantity: (existing.quantity || 0) + itemReward.quantity })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_inventory').insert({
        user_id: userId,
        reward_type_id: itemReward.rewardTypeId,
        quantity: itemReward.quantity,
      });
    }
  }

  // Ajouter les mois premium
  if (challenge.premiumMonthsReward > 0) {
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subscriber) {
      const currentEnd = subscriber.subscription_end ? new Date(subscriber.subscription_end) : new Date();
      const newEnd = new Date(currentEnd);
      newEnd.setMonth(newEnd.getMonth() + challenge.premiumMonthsReward);

      await supabase
        .from('subscribers')
        .update({
          subscribed: true,
          subscription_end: newEnd.toISOString(),
        })
        .eq('user_id', userId);
    }
  }

  // Marquer comme réclamé
  await supabase.from('user_challenge_completions').upsert({
    user_id: userId,
    challenge_id: challengeId,
    completed_at: new Date().toISOString(),
    rewards_claimed: true,
    rewards_claimed_at: new Date().toISOString(),
  });

  return { success: true };
}

// Récupérer les défis non vus (pour le popup)
export async function getUnseenChallenges(userId: string): Promise<Challenge[]> {
  const challenges = await getActiveChallenges();
  
  if (challenges.length === 0) return [];

  const { data: seenNotifications } = await supabase
    .from('user_challenge_notifications')
    .select('challenge_id')
    .eq('user_id', userId);

  const seenIds = new Set(seenNotifications?.map(n => n.challenge_id) || []);
  
  return challenges.filter(c => !seenIds.has(c.id));
}

// Marquer un défi comme vu
export async function markChallengeSeen(userId: string, challengeId: string): Promise<void> {
  await supabase.from('user_challenge_notifications').insert({
    user_id: userId,
    challenge_id: challengeId,
  });
}

// Récupérer les livres qui donnent un item spécifique
export async function getBooksWithReward(rewardTypeId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('loot_tables')
    .select(`
      book_id,
      drop_chance_percentage,
      chest_type,
      books (id, title, author, cover_url, genres)
    `)
    .eq('reward_type_id', rewardTypeId)
    .not('book_id', 'is', null);

  if (error) {
    console.error('Error fetching books with reward:', error);
    return [];
  }

  return (data || []).filter(d => d.books).map(d => ({
    ...d.books,
    dropChance: d.drop_chance_percentage,
    chestType: d.chest_type,
  }));
}

// Admin: Créer un défi
export async function createChallenge(
  data: {
    name: string;
    description: string;
    icon: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    orydorsReward: number;
    xpReward: number;
    itemRewards: ItemRewardConfig[];
    premiumMonthsReward: number;
    isGuildChallenge?: boolean;
  },
  objectives: {
    objectiveType: string;
    objectiveName: string;
    targetCount: number;
    targetBookId?: string;
    targetGenre?: string;
    targetRewardTypeId?: string;
  }[]
): Promise<{ success: boolean; challengeId?: string; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  const { data: challenge, error } = await supabase
    .from('challenges')
    .insert({
      name: data.name,
      description: data.description,
      icon: data.icon,
      start_date: data.startDate,
      end_date: data.endDate,
      is_active: data.isActive,
      orydors_reward: data.orydorsReward,
      xp_reward: data.xpReward,
      item_rewards: JSON.parse(JSON.stringify(data.itemRewards)),
      premium_months_reward: data.premiumMonthsReward,
      is_guild_challenge: data.isGuildChallenge || false,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating challenge:', error);
    return { success: false, error: error.message };
  }

  // Créer les objectifs
  if (objectives.length > 0) {
    const objectivesToInsert = objectives.map((obj, index) => ({
      challenge_id: challenge.id,
      objective_type: obj.objectiveType,
      objective_name: obj.objectiveName,
      target_count: obj.targetCount,
      target_book_id: obj.targetBookId || null,
      target_genre: obj.targetGenre || null,
      target_reward_type_id: obj.targetRewardTypeId || null,
      position: index,
    }));

    const { error: objError } = await supabase
      .from('challenge_objectives')
      .insert(objectivesToInsert);

    if (objError) {
      console.error('Error creating objectives:', objError);
    }
  }

  return { success: true, challengeId: challenge.id };
}

// Admin: Mettre à jour un défi
export async function updateChallenge(
  challengeId: string,
  data: {
    name: string;
    description: string;
    icon: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    orydorsReward: number;
    xpReward: number;
    itemRewards: ItemRewardConfig[];
    premiumMonthsReward: number;
    isGuildChallenge?: boolean;
  },
  objectives: {
    objectiveType: string;
    objectiveName: string;
    targetCount: number;
    targetBookId?: string;
    targetGenre?: string;
    targetRewardTypeId?: string;
  }[]
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('challenges')
    .update({
      name: data.name,
      description: data.description,
      icon: data.icon,
      start_date: data.startDate,
      end_date: data.endDate,
      is_active: data.isActive,
      orydors_reward: data.orydorsReward,
      xp_reward: data.xpReward,
      item_rewards: JSON.parse(JSON.stringify(data.itemRewards)),
      premium_months_reward: data.premiumMonthsReward,
      is_guild_challenge: data.isGuildChallenge || false,
    })
    .eq('id', challengeId);

  if (error) {
    console.error('Error updating challenge:', error);
    return { success: false, error: error.message };
  }

  // Supprimer les anciens objectifs et recréer
  await supabase.from('challenge_objectives').delete().eq('challenge_id', challengeId);

  if (objectives.length > 0) {
    const objectivesToInsert = objectives.map((obj, index) => ({
      challenge_id: challengeId,
      objective_type: obj.objectiveType,
      objective_name: obj.objectiveName,
      target_count: obj.targetCount,
      target_book_id: obj.targetBookId || null,
      target_genre: obj.targetGenre || null,
      target_reward_type_id: obj.targetRewardTypeId || null,
      position: index,
    }));

    await supabase.from('challenge_objectives').insert(objectivesToInsert);
  }

  return { success: true };
}

// Admin: Supprimer un défi
export async function deleteChallenge(challengeId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId);

  if (error) {
    console.error('Error deleting challenge:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
