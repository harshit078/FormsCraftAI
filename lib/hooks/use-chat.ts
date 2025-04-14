import { useState, useCallback } from 'react';
import { ChatMessage } from '@/lib/redis';

export function useChat(formId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    try {
      const message = {
        role: 'user' as const,
        content,
        timestamp: Date.now(),
      };

      const response = await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, message }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setMessages((prev) => [...prev, message]);
      
      // Simulate AI response - replace with actual AI integration
      const aiResponse = {
        role: 'assistant' as const,
        content: 'This is a sample response',
        timestamp: Date.now(),
      };

      await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, message: aiResponse }),
      });

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  return {
    messages,
    isLoading,
    sendMessage,
  };
} 