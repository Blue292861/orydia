import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
  xl: 'h-16 w-16 text-xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  username,
  size = 'md',
  className,
}) => {
  const getInitials = () => {
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <Avatar className={cn(sizeClasses[size], 'border border-border/50', className)}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={username || 'User'} />
      ) : null}
      <AvatarFallback className="bg-primary/10 text-primary">
        {avatarUrl ? null : getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};
