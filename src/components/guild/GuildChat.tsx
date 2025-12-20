import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Send, Loader2, Trash2, MessageCircle, RefreshCw } from 'lucide-react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load messages function
  const loadMessages = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setIsRefreshing(true);
    
    console.log('[GuildChat] Loading messages for guild:', guildId);
    const data = await getGuildMessages(guildId);
    console.log('[GuildChat] Loaded messages:', data.length, data);
    
    setMessages(data);
    setIsLoading(false);
    setIsRefreshing(false);
    
    // Scroll to bottom
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [guildId]);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

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
      // Refresh messages after sending (backup if realtime doesn't work)
      setTimeout(() => loadMessages(false), 500);
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
      <Card className="p-6 bg-forest-900/80 border-forest-600">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-forest-900/80 border-forest-600 flex flex-col h-[400px]">
      {/* Header with refresh button */}
      <div className="p-3 border-b border-forest-600 flex items-center justify-between">
        <span className="text-sm font-medium text-gold-300">Chat de la Guilde</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadMessages(false)}
          disabled={isRefreshing}
          className="text-gold-400 hover:text-gold-300 hover:bg-forest-700/50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gold-300/70">
            <MessageCircle className="w-10 h-10 mb-2 text-gold-400/50" />
            <p className="text-gold-200">Aucun message pour le moment</p>
            <p className="text-sm text-gold-300/60">Soyez le premier à écrire !</p>
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
                    <AvatarFallback className="bg-forest-700 text-gold-200 text-xs">
                      {getInitials(msg)}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-medium text-gold-200">
                        {getDisplayName(msg)}
                      </span>
                      <span className="text-xs text-wood-300">
                        {formatMessageDate(msg.created_at)}
                      </span>
                    </div>
                    
                    <div className={`group relative rounded-lg px-3 py-2 ${
                      isOwn 
                        ? 'bg-gold-500/30 text-wood-50' 
                        : 'bg-forest-700/80 text-wood-100'
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
      <div className="p-3 border-t border-forest-600 bg-forest-800/50">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrire un message..."
            maxLength={1000}
            disabled={isSending}
            className="flex-1 bg-forest-800 border-forest-500 text-white placeholder:text-wood-400 focus:border-gold-500"
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
