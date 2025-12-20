export interface ReaderOath {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  book_cover_url?: string;
  stake_amount: 300 | 500 | 1000;
  bonus_percentage: number;
  deadline: string;
  created_at: string;
  resolved_at?: string;
  status: 'active' | 'won' | 'lost';
  payout_amount?: number;
}

export interface ActiveOath {
  id: string;
  book_id: string;
  book_title: string;
  book_cover_url?: string;
  stake_amount: number;
  bonus_percentage: number;
  potential_win: number;
  potential_loss: number;
  deadline: string;
  created_at: string;
  time_remaining: string;
}

export interface OathHistory {
  id: string;
  book_id: string;
  book_title: string;
  book_cover_url?: string;
  stake_amount: number;
  payout_amount?: number;
  status: 'won' | 'lost';
  deadline: string;
  created_at: string;
  resolved_at?: string;
}

export interface OathStats {
  total_oaths: number;
  won_oaths: number;
  lost_oaths: number;
  active_oaths: number;
  win_rate: number;
  total_wagered: number;
  total_won: number;
  total_lost: number;
  net_profit: number;
}

export interface PlaceOathResult {
  success: boolean;
  error?: string;
  oath_id?: string;
  stake_amount?: number;
  potential_win?: number;
  potential_loss?: number;
  deadline?: string;
}

export interface ResolveOathResult {
  success: boolean;
  error?: string;
  status?: 'won' | 'lost';
  payout_amount?: number;
  book_title?: string;
}

export const STAKE_OPTIONS = [300, 500, 1000] as const;
export type StakeAmount = typeof STAKE_OPTIONS[number];
