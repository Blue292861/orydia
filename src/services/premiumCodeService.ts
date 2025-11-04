import { supabase } from '@/integrations/supabase/client';
import { PremiumCode, CreatePremiumCodeRequest, PremiumCodeRedemption } from '@/types/PremiumCode';

const generateRandomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
};

export const premiumCodeService = {
  async generateCodes(request: CreatePremiumCodeRequest): Promise<PremiumCode[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const quantity = request.quantity || 1;
    const codes: PremiumCode[] = [];

    for (let i = 0; i < quantity; i++) {
      const code = request.custom_code || generateRandomCode();
      
      const { data, error } = await supabase
        .from('premium_codes')
        .insert({
          code,
          subscription_type: request.subscription_type,
          duration_months: request.duration_months,
          max_uses: request.max_uses,
          expires_at: request.expires_at,
          is_single_use: request.is_single_use,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      codes.push(data as PremiumCode);
    }

    return codes;
  },

  async getAllCodes(): Promise<PremiumCode[]> {
    const { data, error } = await supabase
      .from('premium_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as PremiumCode[]) || [];
  },

  async deleteCode(codeId: string): Promise<void> {
    const { error } = await supabase
      .from('premium_codes')
      .delete()
      .eq('id', codeId);

    if (error) throw error;
  },

  async redeemCode(code: string): Promise<{ success: boolean; months_granted?: number; message: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: premiumCode, error: codeError } = await supabase
      .from('premium_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (codeError || !premiumCode) {
      return { success: false, message: 'Code invalide' };
    }

    const typedCode = premiumCode as PremiumCode;

    if (typedCode.expires_at && new Date(typedCode.expires_at) < new Date()) {
      return { success: false, message: 'Code expiré' };
    }

    if (typedCode.max_uses && typedCode.current_uses >= typedCode.max_uses) {
      return { success: false, message: 'Code épuisé' };
    }

    if (typedCode.is_single_use) {
      const { data: existingRedemption } = await supabase
        .from('premium_code_redemptions')
        .select('id')
        .eq('code_id', typedCode.id)
        .eq('user_id', user.id)
        .single();

      if (existingRedemption) {
        return { success: false, message: 'Code déjà utilisé' };
      }
    }

    const { error: redemptionError } = await supabase
      .from('premium_code_redemptions')
      .insert({
        code_id: typedCode.id,
        user_id: user.id,
        subscription_type: typedCode.subscription_type,
        months_granted: typedCode.duration_months,
      });

    if (redemptionError) throw redemptionError;

    const { error: updateError } = await supabase
      .from('premium_codes')
      .update({ current_uses: typedCode.current_uses + 1 })
      .eq('id', typedCode.id);

    if (updateError) throw updateError;

    await supabase.rpc('grant_manual_premium_secure', {
      p_user_id: user.id,
      p_months: typedCode.duration_months
    });

    return {
      success: true,
      months_granted: typedCode.duration_months,
      message: `${typedCode.duration_months} mois de premium ajoutés !`
    };
  },

  generateCSV(codes: PremiumCode[]): string {
    const header = 'Code,Type,Durée (mois),Usages max,Usages actuels,Date expiration\n';
    const rows = codes.map(code => 
      `${code.code},${code.subscription_type === 'monthly' ? 'Mensuel' : 'Annuel'},${code.duration_months},${code.max_uses || 'Illimité'},${code.current_uses},${code.expires_at || 'Jamais'}`
    ).join('\n');
    return header + rows;
  },

  downloadCSV(codes: PremiumCode[], filename: string = 'premium_codes.csv'): void {
    const csv = this.generateCSV(codes);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  },

  async getAllRedemptions(): Promise<PremiumCodeRedemption[]> {
    const { data, error } = await supabase
      .from('premium_code_redemptions')
      .select('*')
      .order('redeemed_at', { ascending: false });

    if (error) throw error;
    return (data as PremiumCodeRedemption[]) || [];
  }
};
