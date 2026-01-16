import { Mail, X } from 'lucide-react'
import Button from '../ui/Button'

interface FloatingActionBarProps {
  selectedCount: number
  onSend: () => void
  onClear: () => void
}

export default function FloatingActionBar({
  selectedCount,
  onSend,
  onClear,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-slate-900">
            {selectedCount === 1
              ? '1 vendor selected'
              : `${selectedCount} vendors selected`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onSend}>
            <Mail className="mr-2 h-4 w-4" />
            Send RFP to {selectedCount} Vendor{selectedCount !== 1 ? 's' : ''}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
