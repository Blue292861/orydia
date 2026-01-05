import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Flame, Clock, RotateCcw, Sparkles, Gift, Crown, CreditCard, Mail } from 'lucide-react';
import { 
  WheelConfig, 
  WheelSegment, 
  WheelSpinResult, 
  WheelStreak, 
  StreakBonus,
  STREAK_RECOVERY_COST 
} from '@/types/FortuneWheel';
import { 
  getActiveWheelConfig, 
  getUserStreak, 
  canSpinForFree, 
  getTimeUntilNextFreeSpin,
  getStreakBonuses,
  checkUserPremium
} from '@/services/fortuneWheelService';
import { useConfetti } from '@/hooks/useConfetti';

// SVG arc utilities for wheel segments
const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  };
};

const describeArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", cx, cy,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");
};

interface FortuneWheelProps {
  onSpinComplete?: () => void;
}

export const FortuneWheel: React.FC<FortuneWheelProps> = ({ onSpinComplete }) => {
  const { user } = useAuth();
  const { triggerConfetti } = useConfetti();
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const [config, setConfig] = useState<WheelConfig | null>(null);
  const [streak, setStreak] = useState<WheelStreak | null>(null);
  const [bonuses, setBonuses] = useState<StreakBonus[]>([]);
  const [canSpin, setCanSpin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<WheelSpinResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recoveringStreak, setRecoveringStreak] = useState(false);
  const [purchasingExtraSpin, setPurchasingExtraSpin] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        const [configData, streakData, bonusesData, canSpinData, isPremiumData] = await Promise.all([
          getActiveWheelConfig(),
          getUserStreak(user.id),
          getStreakBonuses(),
          canSpinForFree(user.id),
          checkUserPremium(user.id)
        ]);
        
        setConfig(configData);
        setStreak(streakData);
        setBonuses(bonusesData);
        setCanSpin(canSpinData);
        setIsPremium(isPremiumData);
      } catch (error) {
        console.error('Error loading wheel data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Timer for next free spin
  useEffect(() => {
    if (canSpin) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const ms = getTimeUntilNextFreeSpin();
      if (ms <= 0) {
        setCanSpin(true);
        setTimeRemaining('');
        return;
      }
      
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((ms % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [canSpin]);

  // Get active bonus for current streak
  const getActiveBonus = (): StreakBonus | null => {
    if (!streak || !bonuses.length) return null;
    
    const applicableBonuses = bonuses
      .filter(b => b.streakLevel <= streak.currentStreak && b.isActive)
      .sort((a, b) => b.streakLevel - a.streakLevel);
    
    return applicableBonuses[0] || null;
  };

  // Handle spin
  const handleSpin = async (isPaid = false) => {
    if (!user || !config || isSpinning) return;
    
    setIsSpinning(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('spin-wheel', {
        body: { isPaidSpin: isPaid }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors du tour');
      }
      
      // Animate the wheel
      const segmentAngle = 360 / config.segments.length;
      const targetAngle = 360 - (data.segmentIndex * segmentAngle + segmentAngle / 2);
      const spins = 5 + Math.random() * 3; // 5-8 full rotations
      const finalRotation = rotation + (spins * 360) + targetAngle;
      
      setRotation(finalRotation);
      
      // Wait for animation to complete
      setTimeout(() => {
        setSpinResult(data);
        setShowResultDialog(true);
        setIsSpinning(false);
        setCanSpin(false);
        
        // Update streak
        if (data.newStreak !== undefined) {
          setStreak(prev => prev ? { ...prev, currentStreak: data.newStreak } : null);
        }
        
        // Fire confetti for good rewards
        if (data.reward.type === 'item' || data.reward.type === 'gift_card' || (data.reward.type === 'orydors' && data.reward.value && data.reward.value >= 1000)) {
          triggerConfetti();
        }
        
        onSpinComplete?.();
      }, 4000);
      
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
      setIsSpinning(false);
    }
  };

  // Handle streak recovery
  const handleRecoverStreak = async () => {
    if (!user || recoveringStreak) return;
    
    setRecoveringStreak(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('recover-streak', {});
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération');
      }
      
      toast({
        title: 'Série récupérée !',
        description: `Votre série de ${data.recoveredStreak} jours a été restaurée.`,
      });
      
      setStreak(prev => prev ? { 
        ...prev, 
        currentStreak: data.recoveredStreak,
        streakBrokenAt: null 
      } : null);
      
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setRecoveringStreak(false);
    }
  };

  // Handle extra spin purchase
  const handlePurchaseExtraSpin = async () => {
    if (!user || purchasingExtraSpin) return;
    
    setPurchasingExtraSpin(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-wheel-checkout', {});
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
      setPurchasingExtraSpin(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-wood-100 to-wood-200 border-gold-400">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card className="bg-gradient-to-br from-wood-100 to-wood-200 border-gold-400">
        <CardContent className="py-6 text-center text-muted-foreground">
          La roue de la fortune n'est pas disponible actuellement.
        </CardContent>
      </Card>
    );
  }

  // Check premium restriction
  if (config.isPremiumOnly && !isPremium) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-400">
        <CardContent className="py-8 text-center space-y-4">
          <Crown className="h-12 w-12 mx-auto text-amber-500" />
          <div>
            <h3 className="text-lg font-semibold text-amber-800">Roue Premium</h3>
            <p className="text-sm text-amber-600 mt-1">
              Cette roue exclusive est réservée aux membres Premium.
            </p>
          </div>
          <Button variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50">
            Devenir Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activeBonus = getActiveBonus();

  return (
    <>
      <Card className="bg-gradient-to-br from-wood-100 via-wood-50 to-gold-100 border-2 border-gold-400 shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-wood-800">
              <Sparkles className="h-5 w-5 text-gold-500" />
              Roue de la Fortune
            </CardTitle>
            {streak && streak.currentStreak > 0 && (
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-700 border-orange-400">
                <Flame className="h-3 w-3 mr-1" />
                {streak.currentStreak} jour{streak.currentStreak > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          {activeBonus && (
            <p className="text-xs text-gold-700 mt-1">
              ✨ {activeBonus.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Wheel */}
          <div className="relative flex justify-center">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-gold-600 drop-shadow-lg" />
            </div>
            
            {/* Responsive wheel container */}
            <div 
              ref={wheelRef}
              className="relative w-full max-w-[240px] sm:max-w-[280px] md:max-w-[320px] aspect-square"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
              }}
            >
              <svg 
                viewBox="0 0 200 200" 
                className="w-full h-full drop-shadow-xl"
              >
                {/* Outer border */}
                <circle cx="100" cy="100" r="98" fill="none" stroke="hsl(var(--gold-500))" strokeWidth="4" />
                
                {/* Segments */}
                {config.segments.map((segment, index) => {
                  const segmentCount = config.segments.length;
                  const angle = 360 / segmentCount;
                  const startAngle = index * angle - 90; // Start from top
                  const endAngle = startAngle + angle;
                  
                  // Calculate arc path
                  const path = describeArc(100, 100, 90, startAngle, endAngle);
                  
                  // Calculate text position (middle of segment)
                  const midAngle = startAngle + angle / 2;
                  const textRadius = 55; // Distance from center
                  const textX = 100 + textRadius * Math.cos((midAngle * Math.PI) / 180);
                  const textY = 100 + textRadius * Math.sin((midAngle * Math.PI) / 180);
                  
                  // Truncate label if too long
                  const maxChars = segmentCount <= 4 ? 16 : segmentCount <= 6 ? 12 : 10;
                  const displayLabel = segment.label.length > maxChars 
                    ? segment.label.substring(0, maxChars - 1) + '…' 
                    : segment.label;
                  
                  // Dynamic font size based on segment count
                  const fontSize = segmentCount <= 4 ? 10 : segmentCount <= 6 ? 9 : segmentCount <= 8 ? 8 : 7;
                  
                  return (
                    <g key={segment.id}>
                      <path 
                        d={path} 
                        fill={segment.color}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="1"
                      />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize={fontSize}
                        fontWeight="bold"
                        transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                        style={{ 
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                          pointerEvents: 'none'
                        }}
                      >
                        {displayLabel}
                      </text>
                    </g>
                  );
                })}
                
                {/* Center circle */}
                <circle cx="100" cy="100" r="22" fill="url(#centerGradient)" stroke="hsl(var(--gold-300))" strokeWidth="2" />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(45, 93%, 58%)" />
                    <stop offset="100%" stopColor="hsl(45, 93%, 47%)" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center icon overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md" />
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-2">
            {canSpin ? (
              <Button 
                onClick={() => handleSpin(false)} 
                disabled={isSpinning}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold"
              >
                {isSpinning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    La roue tourne...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Tourner gratuitement !
                  </>
                )}
              </Button>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Prochain tour dans {timeRemaining}
                </div>
                <Button 
                  onClick={handlePurchaseExtraSpin}
                  disabled={purchasingExtraSpin || isSpinning}
                  variant="outline"
                  className="w-full border-gold-400 text-gold-700 hover:bg-gold-50"
                >
                  {purchasingExtraSpin ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Tour supplémentaire (0,50€)
                </Button>
              </>
            )}
            
            {/* Streak recovery */}
            {streak && streak.streakBrokenAt && streak.streakBrokenAt > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs text-orange-700 mb-2">
                  ⚠️ Série interrompue au jour {streak.streakBrokenAt}
                </p>
                <Button 
                  onClick={handleRecoverStreak}
                  disabled={recoveringStreak}
                  variant="outline"
                  size="sm"
                  className="w-full border-orange-400 text-orange-700 hover:bg-orange-100"
                >
                  {recoveringStreak ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Flame className="h-4 w-4 mr-2" />
                  )}
                  Reprendre pour {STREAK_RECOVERY_COST} Orydors
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="bg-gradient-to-br from-wood-50 to-gold-100 border-2 border-gold-400">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-wood-800">
              🎉 Félicitations !
            </DialogTitle>
            <DialogDescription className="text-center">
              Voici votre récompense
            </DialogDescription>
          </DialogHeader>
          
          {spinResult && (
            <div className="py-6 text-center space-y-4">
              {spinResult.reward.giftCard ? (
                <div className="space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                    <CreditCard className="h-10 w-10 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-wood-800">
                    Carte Cadeau Oryshop
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {spinResult.reward.giftCard.amount}€
                  </p>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Votre code :</p>
                    <p className="text-lg font-mono font-bold tracking-wider text-wood-800">
                      {spinResult.reward.giftCard.code}
                    </p>
                  </div>
                  {spinResult.reward.giftCard.emailSent && (
                    <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                      <Mail className="h-4 w-4" />
                      Code envoyé par email !
                    </p>
                  )}
                </div>
              ) : spinResult.reward.item ? (
                <div className="space-y-2">
                  <img 
                    src={spinResult.reward.item.imageUrl} 
                    alt={spinResult.reward.item.name}
                    className="w-24 h-24 mx-auto rounded-lg border-2 border-gold-400 shadow-lg"
                  />
                  <p className="text-lg font-semibold text-wood-800">
                    {spinResult.reward.item.quantity}x {spinResult.reward.item.name}
                  </p>
                  <Badge className="bg-purple-500 text-white">
                    {spinResult.reward.item.rarity}
                  </Badge>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-5xl">
                    {spinResult.reward.type === 'orydors' ? '💰' : '⚡'}
                  </div>
                  <p className="text-2xl font-bold text-gold-600">
                    +{spinResult.reward.value} {spinResult.reward.type === 'orydors' ? 'Orydors' : 'XP'}
                  </p>
                </div>
              )}
              
              {spinResult.bonusApplied && (
                <p className="text-sm text-gold-700">
                  ✨ Bonus appliqué : {spinResult.bonusApplied}
                </p>
              )}
              
              {spinResult.xpData?.didLevelUp && (
                <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-green-700 font-semibold">
                    🎊 Niveau {spinResult.xpData.levelAfter} atteint !
                  </p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Série actuelle : {spinResult.newStreak} jour{spinResult.newStreak > 1 ? 's' : ''} 🔥
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setShowResultDialog(false)}
              className="w-full bg-gold-500 hover:bg-gold-600 text-white"
            >
              Super !
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
