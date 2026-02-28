'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import apiService from '@/lib/api-service'
import realtimeService from '@/lib/realtime-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalSalons: number
  activeBookings: number
  totalStaff: number
  monthlyRevenue: number
  totalUsers: number
  pendingBookings: number
  completedBookings: number
  cancelledBookings: number
}

interface RecentBooking {
  id: string
  customerName: string
  salonName: string
  serviceName: string
  bookingDate: string
  status: string
  price: number
}

interface TopService {
  id: string
  name: string
  price: number
  bookingCount: number
  revenue: number
}

interface RevenueData {
  month: string
  revenue: number
  bookings: number
}

export default function DashboardPage() {
  const { hasPermission } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalSalons: 0,
    activeBookings: 0,
    totalStaff: 0,
    monthlyRevenue: 0,
    totalUsers: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [topServices, setTopServices] = useState<TopService[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    
    // Setup real-time updates for dashboard
    const unsubscribeBookingCreated = realtimeService.on('booking.created', () => loadDashboardData())
    const unsubscribeBookingUpdated = realtimeService.on('booking.updated', () => loadDashboardData())
    const unsubscribeBookingCancelled = realtimeService.on('booking.cancelled', () => loadDashboardData())
    const unsubscribePaymentCompleted = realtimeService.on('payment.completed', () => loadDashboardData())

    realtimeService.connect().catch(console.error)

    return () => {
      unsubscribeBookingCreated()
      unsubscribeBookingUpdated()
      unsubscribeBookingCancelled()
      unsubscribePaymentCompleted()
      realtimeService.disconnect()
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load analytics overview
      const analytics = await apiService.getAnalyticsOverview()
      
      // Load recent bookings
      const bookings = await apiService.getBookings({ limit: 5, sort: 'createdAt', order: 'desc' })
      
      // Load top services
      const services = await apiService.getServicesAnalytics({ limit: 5 })
      
      // Load revenue data
      const revenue = await apiService.getRevenueAnalytics({ period: '6months' })

      setStats({
        totalSalons: analytics.totalSalons || 0,
        activeBookings: analytics.activeBookings || 0,
        totalStaff: analytics.totalStaff || 0,
        monthlyRevenue: analytics.monthlyRevenue || 0,
        totalUsers: analytics.totalUsers || 0,
        pendingBookings: analytics.pendingBookings || 0,
        completedBookings: analytics.completedBookings || 0,
        cancelledBookings: analytics.cancelledBookings || 0
      })

      setRecentBookings(bookings.map((booking: any) => ({
        id: booking.id,
        customerName: booking.customerName,
        salonName: booking.salon?.name || 'Unknown',
        serviceName: booking.service?.name || 'Unknown',
        bookingDate: booking.bookingDate,
        status: booking.status,
        price: booking.service?.price || 0
      })))

      setTopServices(services.map((service: any) => ({
        id: service.id,
        name: service.name,
        price: service.price,
        bookingCount: service.bookingCount,
        revenue: service.revenue
      })))

      setRevenueData(revenue.map((item: any) => ({
        month: item.month,
        revenue: item.revenue,
        bookings: item.bookings
      })))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const statsDisplay = [
    { label: 'Total Salons', value: stats.totalSalons.toString(), change: '+12%', icon: '🏪', color: 'text-blue-600' },
    { label: 'Active Bookings', value: stats.activeBookings.toString(), change: '+8%', icon: '📅', color: 'text-green-600' },
    { label: 'Staff Members', value: stats.totalStaff.toString(), change: '+3%', icon: '👥', color: 'text-purple-600' },
    { label: 'Monthly Revenue', value: `$${(stats.monthlyRevenue / 1000).toFixed(1)}K`, change: '+23%', icon: '💰', color: 'text-yellow-600' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

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
              <span className={`text-3xl ${stat.color}`}>{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Bookings</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>
        </Card>
        <Card className="bg-card border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedBookings}</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </Card>
        <Card className="bg-card border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <span className="text-2xl">👤</span>
          </div>
        </Card>
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
          
          {/* Revenue Chart */}
          <div className="space-y-3">
            {revenueData.map((data, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
                  <span className="text-xs font-semibold text-foreground">${(data.revenue / 1000).toFixed(1)}K</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${Math.min((data.revenue / Math.max(...revenueData.map(d => d.revenue))) * 100, 100)}%` }}
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
            {topServices.map((service, i) => (
              <div key={service.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                <div className="flex-1">
                  <span className="text-sm text-foreground font-medium">{service.name}</span>
                  <p className="text-xs text-muted-foreground">{service.bookingCount} bookings</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-primary">${service.revenue.toFixed(0)}</span>
                  <p className="text-xs text-muted-foreground">${service.price}</p>
                </div>
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
          {hasPermission('bookings.view') && (
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => router.push('/dashboard/bookings')}
            >
              View All
            </Button>
          )}
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
                  <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Price</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{booking.customerName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{booking.salonName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{booking.serviceName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(booking.bookingDate).toLocaleDateString()} • {new Date(booking.bookingDate).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">${booking.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentBookings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent bookings found.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
