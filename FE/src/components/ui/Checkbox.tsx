import { InputHTMLAttributes, forwardRef } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, ...props }, ref) => {
    return (
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          checked={checked}
          {...props}
        />
        <div
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded border-2 transition-all',
            'border-slate-300 bg-white',
            'peer-checked:border-slate-900 peer-checked:bg-slate-900',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-slate-950 peer-focus-visible:ring-offset-2',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            'hover:border-slate-400 peer-checked:hover:border-slate-800',
            className
          )}
        >
          {checked && <Check className="h-3.5 w-3.5 text-white" />}
        </div>
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
