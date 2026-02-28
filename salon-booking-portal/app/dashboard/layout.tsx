'use client'

import { Sidebar } from '@/components/sidebar'
import { useAuth } from '@/contexts/auth-context'
import { withAuth } from '@/contexts/auth-context'

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default withAuth(DashboardLayoutContent)
