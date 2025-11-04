export interface PremiumCode {
  id: string;
  code: string;
  subscription_type: 'monthly' | 'annual';
  duration_months: number;
  max_uses?: number;
  current_uses: number;
  expires_at?: string;
  is_single_use: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePremiumCodeRequest {
  custom_code?: string;
  subscription_type: 'monthly' | 'annual';
  duration_months: number;
  max_uses?: number;
  expires_at?: string;
  is_single_use: boolean;
  quantity?: number;
}

export interface PremiumCodeRedemption {
  id: string;
  code_id: string;
  user_id: string;
  subscription_type: string;
  months_granted: number;
  redeemed_at: string;
}
