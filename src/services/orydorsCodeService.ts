import { supabase } from "@/integrations/supabase/client";
import { OrydorsCode, OrydorsCodeRedemption, CreateOrydorsCodeRequest, RedeemCodeRequest, RedeemCodeResponse } from "@/types/OrydorsCode";

// Generate random 8-character code
const generateRandomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const orydorsCodeService = {
  // Admin: Generate codes
  async generateCodes(request: CreateOrydorsCodeRequest): Promise<OrydorsCode[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const codes: Array<{
      code: string;
      points_value: number;
      max_uses?: number;
      expires_at?: string;
      is_single_use: boolean;
      created_by: string;
    }> = [];
    const quantity = request.quantity || 1;

    for (let i = 0; i < quantity; i++) {
      const code = request.custom_code || generateRandomCode();
      codes.push({
        code,
        points_value: request.points_value,
        max_uses: request.max_uses,
        expires_at: request.expires_at,
        is_single_use: request.is_single_use,
        created_by: user.id
      });
    }

    const { data, error } = await supabase
      .from('tensens_codes')
      .insert(codes)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Admin: Get all codes
  async getAllCodes(): Promise<OrydorsCode[]> {
    const { data, error } = await supabase
      .from('tensens_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Admin: Delete code
  async deleteCode(codeId: string): Promise<void> {
    const { error } = await supabase
      .from('tensens_codes')
      .delete()
      .eq('id', codeId);

    if (error) throw error;
  },

  // User: Redeem code
  async redeemCode(request: RedeemCodeRequest): Promise<RedeemCodeResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get the code
    const { data: codeData, error: codeError } = await supabase
      .from('tensens_codes')
      .select('*')
      .eq('code', request.code.toUpperCase())
      .single();

    if (codeError || !codeData) {
      return {
        success: false,
        message: "Code invalide ou inexistant"
      };
    }

    // Check if expired
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return {
        success: false,
        message: "Ce code a expiré"
      };
    }

    // Check usage limits
    if (codeData.max_uses && codeData.current_uses >= codeData.max_uses) {
      return {
        success: false,
        message: "Ce code a atteint sa limite d'utilisations"
      };
    }

    // Check if user already used this code (for single-use codes)
    if (codeData.is_single_use) {
      const { data: existingRedemption } = await supabase
        .from('tensens_code_redemptions')
        .select('id')
        .eq('code_id', codeData.id)
        .eq('user_id', user.id)
        .single();

      if (existingRedemption) {
        return {
          success: false,
          message: "Vous avez déjà utilisé ce code"
        };
      }
    }

    try {
      // Start transaction: Create redemption
      const { error: redemptionError } = await supabase
        .from('tensens_code_redemptions')
        .insert({
          code_id: codeData.id,
          user_id: user.id,
          points_awarded: codeData.points_value
        });

      if (redemptionError) throw redemptionError;

      // Update code usage count
      const { error: updateError } = await supabase
        .from('tensens_codes')
        .update({
          current_uses: codeData.current_uses + 1
        })
        .eq('id', codeData.id);

      if (updateError) throw updateError;

      // Award points using the edge function
      const { error: pointsError } = await supabase.functions.invoke('award-points', {
        body: {
          user_id: user.id,
          points: codeData.points_value,
          transaction_type: 'code_redemption',
          reference_id: codeData.id,
          description: `Code Orydors utilisé: ${codeData.code}`,
          source_app: 'main_app'
        }
      });

      if (pointsError) throw pointsError;

      return {
        success: true,
        points_awarded: codeData.points_value,
        message: `Félicitations ! Vous avez gagné ${codeData.points_value} Orydors !`
      };

    } catch (error: any) {
      return {
        success: false,
        message: "Erreur lors de l'utilisation du code : " + (error.message || "Erreur inconnue")
      };
    }
  },

  // Get user's redemption history
  async getUserRedemptions(userId: string): Promise<OrydorsCodeRedemption[]> {
    const { data, error } = await supabase
      .from('tensens_code_redemptions')
      .select(`
        *,
        tensens_codes:code_id (
          code,
          points_value
        )
      `)
      .eq('user_id', userId)
      .order('redeemed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
