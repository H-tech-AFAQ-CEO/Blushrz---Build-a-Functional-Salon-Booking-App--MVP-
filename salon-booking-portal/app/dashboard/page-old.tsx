'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/client-database'

interface DashboardStats {
  totalSalons: number
  activeBookings: number
  totalStaff: number
  monthlyRevenue: number
}

interface RecentBooking {
  id: number
  customer_name: string
  salon_name: string
  service_name: string
  booking_date: string
  status: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSalons: 0,
    activeBookings: 0,
    totalStaff: 0,
    monthlyRevenue: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get total salons
      const salons = await db.all('SELECT COUNT(*) as count FROM salons WHERE status = "active"')
      
      // Get active bookings
      const bookings = await db.all('SELECT COUNT(*) as count FROM bookings WHERE status IN ("pending", "confirmed")')
      
      // Get total staff
      const staff = await db.all('SELECT COUNT(*) as count FROM staff WHERE status = "active"')
      
      // Calculate monthly revenue (simplified)
      const revenue = await db.all(`
        SELECT SUM(s.price) as total 
        FROM bookings b 
        JOIN services s ON b.service_id = s.id 
        WHERE b.status = "confirmed" 
        AND strftime('%Y-%m', b.booking_date) = strftime('%Y-%m', 'now')
      `)

      // Get recent bookings with joins
      const recent = await db.all(`
        SELECT 
          b.id,
          b.customer_name,
          b.booking_date,
          b.status,
          sa.name as salon_name,
          se.name as service_name
        FROM bookings b
        JOIN salons sa ON b.salon_id = sa.id
        JOIN services se ON b.service_id = se.id
        ORDER BY b.created_at DESC
        LIMIT 5
      `)

      setStats({
        totalSalons: salons[0]?.count || 0,
        activeBookings: bookings[0]?.count || 0,
        totalStaff: staff[0]?.count || 0,
        monthlyRevenue: revenue[0]?.total || 0
      })
      setRecentBookings(recent)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsDisplay = [
    { label: 'Total Salons', value: stats.totalSalons.toString(), change: '+12%', icon: '🏪' },
    { label: 'Active Bookings', value: stats.activeBookings.toString(), change: '+8%', icon: '📅' },
    { label: 'Staff Members', value: stats.totalStaff.toString(), change: '+3%', icon: '👥' },
    { label: 'Monthly Revenue', value: `$${(stats.monthlyRevenue / 1000).toFixed(1)}K`, change: '+23%', icon: '💰' },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat, index) => (
          <Card key={index} className="bg-card border-border/50 p-6 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                <p className="text-xs text-primary font-semibold mt-2">{stat.change} from last month</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 bg-card border-border/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Revenue Trend</h2>
              <p className="text-sm text-muted-foreground">Last 6 months performance</p>
            </div>
            <select className="px-3 py-1 text-sm bg-secondary border border-border/50 rounded text-foreground">
              <option>Last 6 months</option>
              <option>Last 3 months</option>
              <option>Last month</option>
            </select>
          </div>
          
          {/* Simple bar chart visualization */}
          <div className="space-y-3">
            {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].map((month, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground font-medium">{month}</span>
                  <span className="text-xs font-semibold text-foreground">${(30 + i * 8).toFixed(1)}K</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${(30 + i * 8) / 50 * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Services */}
        <Card className="bg-card border-border/50 p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Top Services</h2>
          <div className="space-y-3">
            {['Hair Styling', 'Manicure', 'Massage', 'Facial', 'Coloring'].map((service, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                <span className="text-sm text-foreground">{service}</span>
                <span className="text-xs font-bold text-primary">{45 - i * 8}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Recent Bookings</h2>
            <p className="text-sm text-muted-foreground">Latest customer appointments</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            View All
          </Button>
        </div>

        <Card className="bg-card border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/50 bg-secondary/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Salon</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{booking.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{booking.salon_name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{booking.service_name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(booking.booking_date).toLocaleDateString()} • {new Date(booking.booking_date).toLocaleTimeString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'confirmed'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
