'use client'

import { Sidebar } from '@/components/sidebar'
import { useEffect, useState } from 'react'
import { db } from '@/lib/client-database'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuth, setIsAuth] = useState(false)
  const [dbInitialized, setDbInitialized] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (auth) {
      setIsAuth(true)
    } else {
      window.location.href = '/'
    }

    // Initialize database
    const initDatabase = async () => {
      try {
        await db.init()
        setDbInitialized(true)
      } catch (error) {
        console.error('Error initializing database:', error)
      }
    }
    
    initDatabase()
  }, [])

  if (!isAuth || !dbInitialized) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
