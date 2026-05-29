'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { eventsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export interface ChatMessage {
  id:         number;
  text:       string;
  created_at: string;
  user: {
    id:           number;
    full_name:    string;
    avatar_url?:  string;
    country_code?: string;
    avatar_color: string;
  };
}

export function useEventChat(eventId: number) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error,    setError]    = useState<string | null>(null);
  const [sending,  setSending]  = useState(false);
  const lastId = useRef<number | undefined>(undefined);
  const initialized = useRef(false);

  const fetchMessages = useCallback(async () => {
    try {
      const data: any = await eventsApi.getMessages(
        eventId,
        initialized.current ? lastId.current : undefined
      );
      const incoming: ChatMessage[] = Array.isArray(data) ? data : [];
      if (incoming.length > 0) {
        setMessages(prev =>
          initialized.current ? [...prev, ...incoming] : incoming
        );
        lastId.current = incoming[incoming.length - 1].id;
      }
      initialized.current = true;
    } catch {
      setError('Failed to load messages');
    }
  }, [eventId]);

  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, 4000);
    return () => clearInterval(id);
  }, [fetchMessages]);

  const sendMessage = useCallback(async (text: string) => {
    setSending(true);
    try {
      const data: any = await eventsApi.sendMessage(eventId, { text });
      // Aggiungi subito senza aspettare il polling
      const msg: ChatMessage = data.message ?? data;
      setMessages(prev => [...prev, msg]);
      lastId.current = msg.id;
    } catch {
      throw new Error('Send failed');
    } finally {
      setSending(false);
    }
  }, [eventId]);

  return { messages, error, sending, sendMessage, currentUserId: user?.id };
}
