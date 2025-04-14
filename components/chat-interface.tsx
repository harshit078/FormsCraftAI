"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
}

interface ChatInterfaceProps {
  onSubmit: (prompt: string) => Promise<void>
  isLoading: boolean
  messages: Message[]
}

export function ChatInterface({ onSubmit, isLoading, messages }: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    await onSubmit(prompt)
    setPrompt("")
    textareaRef.current?.focus()
  }

  return (
    <Card className="flex flex-col h-[600px] max-w-2xl mx-auto">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "flex items-start gap-2.5",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                message.role === "user" 
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <motion.div
                layout
                className={cn(
                  "max-w-[80%] rounded-lg p-4",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the form you want to create..."
            className="min-h-[50px] max-h-[200px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !prompt.trim()}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
} 