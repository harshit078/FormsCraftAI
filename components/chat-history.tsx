"use client";

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/lib/redis';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface ChatHistoryProps {
  formId: string;
}

export function ChatHistory({ formId }: ChatHistoryProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: bottomRef, inView } = useInView();

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat-history?formId=${formId}`);
      if (!response.ok) throw new Error('Failed to fetch chat history');
      
      const data = await response.json();
      setMessages(data?.messages || []);
    } catch (error) {
      setError('Failed to load chat history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [formId]);

  useEffect(() => {
    if (!inView) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, inView]);

  if (loading) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </Card>
  );
} 