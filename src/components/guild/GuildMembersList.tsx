import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GuildMember } from '@/types/Guild';
import { Crown, Shield, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GuildMembersListProps {
  members: GuildMember[];
  currentUserId: string;
}

export const GuildMembersList: React.FC<GuildMembersListProps> = ({ members, currentUserId }) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-gold-400" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-wood-200" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Fondateur';
      case 'admin':
        return 'Administrateur';
      default:
        return 'Membre';
    }
  };

  const getInitials = (member: GuildMember) => {
    if (member.profile?.username) {
      return member.profile.username.slice(0, 2).toUpperCase();
    }
    if (member.profile?.first_name) {
      return member.profile.first_name.slice(0, 2).toUpperCase();
    }
    return '??';
  };

  const getDisplayName = (member: GuildMember) => {
    if (member.profile?.username) {
      return member.profile.username;
    }
    if (member.profile?.first_name) {
      return `${member.profile.first_name}${member.profile.last_name ? ` ${member.profile.last_name.charAt(0)}.` : ''}`;
    }
    return 'Membre anonyme';
  };

  // Sort: owner first, then admins, then members
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { owner: 0, admin: 1, member: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  return (
    <Card className="bg-forest-800/50 border-forest-600 divide-y divide-forest-600">
      {sortedMembers.map((member) => (
        <div 
          key={member.id} 
          className={`flex items-center gap-3 p-4 ${member.user_id === currentUserId ? 'bg-gold-500/10' : ''}`}
        >
          <Avatar className="w-10 h-10 border border-forest-500">
            <AvatarImage src={member.profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-forest-700 text-wood-200 text-sm">
              {getInitials(member)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-wood-100 truncate">
                {getDisplayName(member)}
              </span>
              {member.user_id === currentUserId && (
                <span className="text-xs text-gold-400">(vous)</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-wood-200">
              {getRoleIcon(member.role)}
              <span>{getRoleLabel(member.role)}</span>
              <span>•</span>
              <span>
                Depuis {format(new Date(member.joined_at), 'd MMM yyyy', { locale: fr })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
};
