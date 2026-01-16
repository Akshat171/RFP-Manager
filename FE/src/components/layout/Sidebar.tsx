import { NavLink } from 'react-router-dom'
import { PlusSquare, Users, FileText, BarChart3, Save } from 'lucide-react'
import { cn } from '../../lib/utils'

const navigationItems = [
  {
    name: 'RFP Creator',
    href: '/',
    icon: PlusSquare,
    description: 'Create RFPs with natural language',
  },
  {
    name: 'Drafts',
    href: '/drafts',
    icon: Save,
    description: 'Review and send saved drafts',
  },
  {
    name: 'Vendor Directory',
    href: '/vendors',
    icon: Users,
    description: 'Manage vendor master data',
  },
  {
    name: 'Active RFPs',
    href: '/rfps',
    icon: FileText,
    description: 'Track existing RFPs and emails',
  },
  {
    name: 'Evaluation Dashboard',
    href: '/evaluation',
    icon: BarChart3,
    description: 'AI-assisted comparison',
  },
]

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo Area */}
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                RFP Manager
              </span>
              <span className="text-xs text-slate-500">AI-Powered</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive
                        ? 'text-slate-900'
                        : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-xs text-slate-400">
                      {item.description}
                    </span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-600">
              <span className="font-medium text-slate-900">Pro Tip:</span> Use
              natural language to describe your RFP requirements.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
