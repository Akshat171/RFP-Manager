import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from './Button'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const styles = {
    success: {
      container: 'bg-emerald-50 border-emerald-200',
      icon: 'text-emerald-600',
      text: 'text-emerald-900',
      Icon: CheckCircle2,
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      text: 'text-red-900',
      Icon: AlertCircle,
    },
  }

  const config = styles[type]
  const Icon = config.Icon

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg',
          config.container
        )}
      >
        <Icon className={cn('h-5 w-5', config.icon)} />
        <p className={cn('text-sm font-medium', config.text)}>{message}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 ml-2"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
