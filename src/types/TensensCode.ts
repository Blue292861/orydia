export interface TensensCode {
  id: string;
  code: string;
  points_value: number;
  max_uses?: number;
  current_uses: number;
  expires_at?: string;
  is_single_use: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TensensCodeRedemption {
  id: string;
  code_id: string;
  user_id: string;
  points_awarded: number;
  redeemed_at: string;
}

export interface CreateTensensCodeRequest {
  custom_code?: string;
  points_value: number;
  max_uses?: number;
  expires_at?: string;
  is_single_use: boolean;
  quantity?: number; // For bulk generation
}

export interface RedeemCodeRequest {
  code: string;
}

export interface RedeemCodeResponse {
  success: boolean;
  points_awarded?: number;
  message: string;
}