import { User, Bot, Loader2 } from 'lucide-react'
import { ChatMessage } from '../../types/chat'
import { cn } from '../../lib/utils'

interface MessageBubbleProps {
  message: ChatMessage
  children?: React.ReactNode
}

export default function MessageBubble({ message, children }: MessageBubbleProps) {
  const isUser = message.type === 'user'
  const isThinking = message.type === 'thinking'
  const isAI = message.type === 'ai' || message.type === 'action'

  if (isThinking) {
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
          <span className="text-sm text-slate-600">Thinking...</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-slate-700' : 'bg-slate-900'
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-2',
          isUser && 'items-end'
        )}
      >
        <div
          className={cn(
            'rounded-lg px-4 py-3',
            isUser
              ? 'bg-slate-900 text-white'
              : 'border border-slate-200 bg-white text-slate-900'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Action Card (for AI messages with action data) */}
        {children && <div className="w-full">{children}</div>}

        {/* Timestamp */}
        <span className="text-xs text-slate-400">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}
