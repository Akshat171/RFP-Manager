import { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="ml-64">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
