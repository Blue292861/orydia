import { GuildRank } from "@/types/GuildVault";

interface GuildRankBadgeProps {
  rank: GuildRank;
  size?: 'sm' | 'md' | 'lg';
}

export function GuildRankBadge({ rank, size = 'md' }: GuildRankBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${rank.color}20`,
        color: rank.color,
        border: `1px solid ${rank.color}40`
      }}
    >
      <span>{rank.icon}</span>
      <span>{rank.display_name}</span>
    </span>
  );
}
