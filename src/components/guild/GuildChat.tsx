import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getGuildMessages, 
  sendGuildMessage, 
  subscribeToGuildMessages,
  deleteGuildMessage,
  GuildMessage 
} from '@/services/guildChatService';
import { Send, Loader2, Trash2, MessageCircle } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GuildChatProps {
  guildId: string;
}

export const GuildChat: React.FC<GuildChatProps> = ({ guildId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GuildMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      const data = await getGuildMessages(guildId);
      setMessages(data);
      setIsLoading(false);
      // Scroll to bottom
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
    loadMessages();
  }, [guildId]);

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = subscribeToGuildMessages(
      guildId,
      (newMsg) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Scroll to bottom
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      (deletedId) => {
        setMessages(prev => prev.filter(m => m.id !== deletedId));
      }
    );

    return unsubscribe;
  }, [guildId]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const result = await sendGuildMessage(guildId, newMessage);
    
    if (result.success) {
      setNewMessage('');
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Impossible d\'envoyer le message',
        variant: 'destructive'
      });
    }
    setIsSending(false);
  };

  const handleDelete = async (messageId: string) => {
    const result = await deleteGuildMessage(messageId);
    if (!result.success) {
      toast({
        title: 'Erreur',
        description: result.error || 'Impossible de supprimer le message',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return `Aujourd'hui à ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Hier à ${format(date, 'HH:mm')}`;
    }
    return format(date, 'd MMM à HH:mm', { locale: fr });
  };

  const getInitials = (msg: GuildMessage) => {
    if (msg.profile?.username) {
      return msg.profile.username.slice(0, 2).toUpperCase();
    }
    if (msg.profile?.first_name) {
      return msg.profile.first_name.slice(0, 2).toUpperCase();
    }
    return '??';
  };

  const getDisplayName = (msg: GuildMessage) => {
    if (msg.profile?.username) {
      return msg.profile.username;
    }
    if (msg.profile?.first_name) {
      return msg.profile.first_name;
    }
    return 'Membre';
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-forest-800/50 border-forest-600">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-forest-800/50 border-forest-600 flex flex-col h-[400px]">
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-wood-400">
            <MessageCircle className="w-10 h-10 mb-2 opacity-50" />
            <p>Aucun message pour le moment</p>
            <p className="text-sm">Soyez le premier à écrire !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn = msg.user_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={msg.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-forest-700 text-wood-200 text-xs">
                      {getInitials(msg)}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-medium text-wood-300">
                        {getDisplayName(msg)}
                      </span>
                      <span className="text-xs text-wood-500">
                        {formatMessageDate(msg.created_at)}
                      </span>
                    </div>
                    
                    <div className={`group relative rounded-lg px-3 py-2 ${
                      isOwn 
                        ? 'bg-gold-500/20 text-wood-100' 
                        : 'bg-forest-700 text-wood-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      
                      {isOwn && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="p-3 border-t border-forest-600">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrire un message..."
            maxLength={1000}
            disabled={isSending}
            className="flex-1 bg-forest-700/50 border-forest-500 text-wood-100 placeholder:text-wood-500"
          />
          <Button
            onClick={handleSend}
            disabled={isSending || !newMessage.trim()}
            size="icon"
            className="bg-gold-500 hover:bg-gold-600 text-forest-900"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
