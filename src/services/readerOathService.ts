import { supabase } from "@/integrations/supabase/client";
import type { 
  ActiveOath, 
  OathHistory, 
  OathStats, 
  PlaceOathResult, 
  StakeAmount 
} from "@/types/ReaderOath";

export const readerOathService = {
  /**
   * Place un nouveau serment de lecture
   */
  async placeOath(
    bookId: string,
    bookTitle: string,
    bookCoverUrl: string | undefined,
    stakeAmount: StakeAmount,
    deadline: Date
  ): Promise<PlaceOathResult> {
    const { data, error } = await supabase.rpc('place_reader_oath', {
      p_book_id: bookId,
      p_book_title: bookTitle,
      p_book_cover_url: bookCoverUrl || null,
      p_stake_amount: stakeAmount,
      p_deadline: deadline.toISOString(),
    });

    if (error) {
      console.error('[readerOathService] Error placing oath:', error);
      return { success: false, error: error.message };
    }

    return data as unknown as PlaceOathResult;
  },

  /**
   * Récupère les serments actifs de l'utilisateur
   */
  async getActiveOaths(): Promise<ActiveOath[]> {
    const { data, error } = await supabase.rpc('get_user_active_oaths');

    if (error) {
      console.error('[readerOathService] Error fetching active oaths:', error);
      return [];
    }

    return (data || []) as ActiveOath[];
  },

  /**
   * Récupère l'historique des serments
   */
  async getOathHistory(limit: number = 20): Promise<OathHistory[]> {
    const { data, error } = await supabase.rpc('get_user_oath_history', {
      p_limit: limit,
    });

    if (error) {
      console.error('[readerOathService] Error fetching oath history:', error);
      return [];
    }

    return (data || []) as OathHistory[];
  },

  /**
   * Récupère les statistiques de serments
   */
  async getOathStats(): Promise<OathStats | null> {
    const { data, error } = await supabase.rpc('get_user_oath_stats');

    if (error) {
      console.error('[readerOathService] Error fetching oath stats:', error);
      return null;
    }

    return data as unknown as OathStats;
  },

  /**
   * Vérifie et résout un serment lors de la complétion d'un livre
   */
  async checkOathOnCompletion(userId: string, bookId: string): Promise<{
    hasOath: boolean;
    result?: { success: boolean; status?: string; payout_amount?: number };
  }> {
    const { data, error } = await supabase.rpc('check_reader_oath_on_completion', {
      p_user_id: userId,
      p_book_id: bookId,
    });

    if (error) {
      console.error('[readerOathService] Error checking oath on completion:', error);
      return { hasOath: false };
    }

    const result = data as unknown as { has_oath?: boolean; result?: any };
    return {
      hasOath: result?.has_oath || false,
      result: result?.result,
    };
  },

  /**
   * Vérifie si l'utilisateur a un serment actif sur un livre
   */
  async hasActiveOathForBook(bookId: string): Promise<boolean> {
    const activeOaths = await this.getActiveOaths();
    return activeOaths.some(oath => oath.book_id === bookId);
  },

  /**
   * Calcule le temps restant sous forme lisible
   */
  formatTimeRemaining(deadline: string): string {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return "Expiré";
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}j ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    } else {
      return `${diffMinutes}min`;
    }
  },
};
