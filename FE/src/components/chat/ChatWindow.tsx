import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { ChatMessage } from '../../types/chat'
import MessageBubble from './MessageBubble'
import VendorActionCard from './VendorActionCard'
import Button from '../ui/Button'

interface ChatWindowProps {
  onSendMessage: (message: string) => Promise<void>
  messages: ChatMessage[]
  onSendEmails: (messageId: string, vendorIds: string[]) => Promise<void>
  onSaveDraft?: (messageId: string, vendorIds: string[]) => Promise<void>
}

export default function ChatWindow({
  onSendMessage,
  messages,
  onSendEmails,
  onSaveDraft,
}: ChatWindowProps) {
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    const message = input.trim()
    setInput('')
    setIsSending(true)

    try {
      await onSendMessage(message)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSendEmailsForMessage = async (
    messageId: string,
    vendorIds: string[]
  ) => {
    await onSendEmails(messageId, vendorIds)
  }

  const handleSaveDraftForMessage = async (
    messageId: string,
    vendorIds: string[]
  ) => {
    if (onSaveDraft) {
      await onSaveDraft(messageId, vendorIds)
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                AI-Powered RFP Assistant
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-600">
                Describe your requirements in natural language, and I'll help
                you create an RFP and connect with the right vendors.
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-xs font-medium text-slate-700">
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'I need 20 laptops for my office',
                    'Looking for cloud infrastructure services',
                    'Need software development for a mobile app',
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(example)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            messages.map((message) => (
              <MessageBubble key={message.id} message={message}>
                {message.actionData && (
                  <VendorActionCard
                    actionData={message.actionData}
                    onSendEmails={(vendorIds) =>
                      handleSendEmailsForMessage(message.id, vendorIds)
                    }
                    onSaveDraft={onSaveDraft ? (vendorIds) =>
                      handleSaveDraftForMessage(message.id, vendorIds)
                    : undefined}
                  />
                )}
              </MessageBubble>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className=" border-slate-200 ">
        <div className="mx-auto max-w-4xl p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your RFP requirements... (e.g., 'I need 20 laptops and 15 monitors')"
                disabled={isSending}
                rows={1}
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 pr-12 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:opacity-50"
                style={{ maxHeight: '120px' }}
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                Press Enter to send
              </div>
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isSending}
              size="lg"
              className="shrink-0"
            >
              {isSending ? (
                <Sparkles className="h-5 w-5 animate-pulse" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
