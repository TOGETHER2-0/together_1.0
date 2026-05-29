'use client';

import { useState, useEffect, useRef } from 'react';
import { useEventChat } from '@/hooks/useEventChat';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';

interface EventChatProps {
  eventId: number;
}

export function EventChat({ eventId }: EventChatProps) {
  const { messages, error, sendMessage } = useEventChat(eventId);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;
    
    setSending(true);
    const success = await sendMessage(inputText);
    if (success) {
      setInputText('');
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="mt-8 border-t pt-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Event Chat</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Messages Container */}
      <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold">
                  {msg.user.full_name.charAt(0).toUpperCase()}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm text-gray-900">
                      {msg.user.full_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 break-words mt-1">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form */}
      <div className="flex gap-2">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift+Enter for new line)"
          rows={2}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={sending}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim() || sending}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-end"
        >
          <Send size={16} />
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
