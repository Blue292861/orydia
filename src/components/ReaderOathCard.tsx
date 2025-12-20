import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActiveOath, OathHistory } from "@/types/ReaderOath";
import { readerOathService } from "@/services/readerOathService";
import { useNavigate } from "react-router-dom";
import { Clock, Trophy, Skull, BookOpen, Scroll } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReaderOathCardProps {
  oath: ActiveOath | OathHistory;
  variant?: 'active' | 'history';
}

export function ReaderOathCard({ oath, variant = 'active' }: ReaderOathCardProps) {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  
  const isActive = variant === 'active';
  const historyOath = oath as OathHistory;
  const activeOath = oath as ActiveOath;

  // Update countdown every minute for active oaths
  useEffect(() => {
    if (!isActive) return;

    const updateTime = () => {
      setTimeRemaining(readerOathService.formatTimeRemaining(activeOath.deadline));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [isActive, activeOath?.deadline]);

  const handleGoToBook = () => {
    navigate(`/work/${oath.book_id}`);
  };

  const getStatusColor = () => {
    if (isActive) return "border-amber-500/30 bg-amber-500/5";
    if (historyOath.status === 'won') return "border-green-500/30 bg-green-500/5";
    return "border-red-500/30 bg-red-500/5";
  };

  const getStatusBadge = () => {
    if (isActive) {
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500/50">
          <Clock className="h-3 w-3 mr-1" />
          En cours
        </Badge>
      );
    }
    if (historyOath.status === 'won') {
      return (
        <Badge variant="outline" className="text-green-500 border-green-500/50">
          <Trophy className="h-3 w-3 mr-1" />
          Victoire
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-red-500 border-red-500/50">
        <Skull className="h-3 w-3 mr-1" />
        Défaite
      </Badge>
    );
  };

  return (
    <Card className={cn(
      "p-4 border-2 transition-all hover:shadow-md",
      getStatusColor()
    )}>
      <div className="flex gap-3">
        {/* Book cover */}
        <div className="shrink-0">
          {oath.book_cover_url ? (
            <img
              src={oath.book_cover_url}
              alt={oath.book_title}
              className="w-16 h-20 object-cover rounded-md shadow"
            />
          ) : (
            <div className="w-16 h-20 bg-muted rounded-md flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium line-clamp-2 leading-tight">
              {oath.book_title}
            </h4>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Scroll className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-medium">{oath.stake_amount}</span>
              <span className="text-muted-foreground">Orydors</span>
            </div>

            {isActive && timeRemaining && (
              <div className="flex items-center gap-1 text-amber-500">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium">{timeRemaining}</span>
              </div>
            )}

            {!isActive && historyOath.payout_amount !== undefined && (
              <div className={cn(
                "font-medium",
                historyOath.status === 'won' ? "text-green-500" : "text-red-500"
              )}>
                {historyOath.status === 'won' ? '+' : ''}
                {historyOath.payout_amount?.toLocaleString()} Orydors
              </div>
            )}
          </div>

          {isActive && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Gain potentiel: <span className="text-green-500 font-medium">+{activeOath.potential_win}</span>
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                Perte potentielle: <span className="text-red-500 font-medium">-{activeOath.potential_loss}</span>
              </span>
            </div>
          )}

          {isActive && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleGoToBook}
              className="mt-1"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              Lire maintenant
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
