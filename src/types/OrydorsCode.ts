export interface OrydorsCode {
  id: string;
  code: string;
  points_value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_single_use: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OrydorsCodeRedemption {
  id: string;
  code_id: string;
  user_id: string;
  points_awarded: number;
  redeemed_at: string;
  tensens_codes?: {
    code: string;
    points_value: number;
  };
}

export interface CreateOrydorsCodeRequest {
  custom_code?: string;
  points_value: number;
  max_uses?: number;
  expires_at?: string;
  is_single_use: boolean;
  quantity?: number;
}

export interface RedeemCodeRequest {
  code: string;
}

export interface RedeemCodeResponse {
  success: boolean;
  points_awarded?: number;
  message: string;
}
