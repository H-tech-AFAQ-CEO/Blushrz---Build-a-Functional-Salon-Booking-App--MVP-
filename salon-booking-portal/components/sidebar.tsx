'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/salons', label: 'Salons', icon: '🏪' },
  { href: '/dashboard/services', label: 'Services', icon: '✂️' },
  { href: '/dashboard/staff', label: 'Staff', icon: '👥' },
  { href: '/dashboard/bookings', label: 'Bookings', icon: '📅' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  { href: '/dashboard/offers', label: 'Offers', icon: '🎁' },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    window.location.href = '/'
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Salon Admin"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Salon Admin</h1>
            <p className="text-xs text-sidebar-accent-foreground">Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium',
              pathname === item.href
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="px-4 py-3 bg-sidebar-accent/30 rounded-lg">
          <p className="text-xs text-sidebar-accent-foreground font-medium">Admin User</p>
          <p className="text-xs text-sidebar-accent-foreground/70 truncate">demo@admin.com</p>
        </div>
        <Button
          onClick={handleLogout}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground text-sm"
        >
          Logout
        </Button>
      </div>
    </aside>
  )
}
