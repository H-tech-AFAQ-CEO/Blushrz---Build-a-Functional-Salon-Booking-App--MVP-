'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@admin.com')
  const [password, setPassword] = useState('demo123')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login
    setTimeout(() => {
      localStorage.setItem('adminAuth', JSON.stringify({ email }))
      window.location.href = '/dashboard'
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background px-4">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

      <Card className="w-full max-w-md p-8 bg-card border border-border/50">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="Salon Admin"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Salon Admin</h1>
          <p className="text-sm text-muted-foreground mt-2">Professional Management System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="demo@admin.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="demo123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Info */}
        <div className="mt-6 p-3 bg-secondary/50 rounded-lg border border-border/30">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Demo Credentials:</span>
            <br />
            Email: demo@admin.com
            <br />
            Password: demo123
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          This is a demo admin portal for UI/UX showcase
        </p>
      </Card>
    </div>
  )
}
