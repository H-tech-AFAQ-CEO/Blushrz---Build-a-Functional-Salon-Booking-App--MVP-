'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/client-database'

interface AnalyticsData {
  totalBookings: number
  completedServices: number
  avgRating: number
  customerRetention: number
  monthlyRevenue: number
  hourlyBookings: any[]
  servicePerformance: any[]
  salonComparison: any[]
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalBookings: 0,
    completedServices: 0,
    avgRating: 0,
    customerRetention: 0,
    monthlyRevenue: 0,
    hourlyBookings: [],
    servicePerformance: [],
    salonComparison: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      // Total bookings
      const totalBookingsResult = await db.all('SELECT COUNT(*) as count FROM bookings')
      
      // Completed services
      const completedServicesResult = await db.all('SELECT COUNT(*) as count FROM bookings WHERE status = "completed"')
      
      // Monthly revenue
      const revenueResult = await db.all(`
        SELECT SUM(s.price) as total 
        FROM bookings b 
        JOIN services s ON b.service_id = s.id 
        WHERE b.status = "confirmed" 
        AND strftime('%Y-%m', b.booking_date) = strftime('%Y-%m', 'now')
      `)

      // Service performance
      const servicePerformanceResult = await db.all(`
        SELECT 
          s.name as service_name,
          COUNT(b.id) as bookings,
          SUM(s.price) as revenue
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.status IN ('confirmed', 'completed')
        GROUP BY s.id
        ORDER BY revenue DESC
        LIMIT 5
      `)

      // Salon comparison
      const salonComparisonResult = await db.all(`
        SELECT 
          sa.name as salon_name,
          COUNT(b.id) as bookings,
          SUM(s.price) as revenue
        FROM bookings b
        JOIN salons sa ON b.salon_id = sa.id
        JOIN services s ON b.service_id = s.id
        WHERE b.status IN ('confirmed', 'completed')
        GROUP BY sa.id
        ORDER BY revenue DESC
      `)

      // Hourly bookings (simplified - using current date)
      const hourlyBookingsResult = await db.all(`
        SELECT 
          strftime('%H', booking_date) as hour,
          COUNT(*) as bookings
        FROM bookings
        WHERE date(booking_date) = date('now')
        GROUP BY hour
        ORDER BY hour
      `)

      const data = {
        totalBookings: totalBookingsResult[0]?.count || 0,
        completedServices: completedServicesResult[0]?.count || 0,
        avgRating: 4.7, // Placeholder - would need rating table
        customerRetention: 87, // Placeholder - would need customer analysis
        monthlyRevenue: revenueResult[0]?.total || 0,
        servicePerformance: servicePerformanceResult,
        salonComparison: salonComparisonResult,
        hourlyBookings: hourlyBookingsResult
      }

      setAnalyticsData(data)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyticsCards = [
    {
      title: 'Total Bookings',
      value: analyticsData.totalBookings.toString(),
      change: '+18%',
      period: 'vs last month',
      icon: '📅',
    },
    {
      title: 'Completed Services',
      value: analyticsData.completedServices.toString(),
      change: '+22%',
      period: 'vs last month',
      icon: '✓',
    },
    {
      title: 'Avg. Rating',
      value: analyticsData.avgRating.toFixed(1),
      change: '+0.2',
      period: 'vs last month',
      icon: '⭐',
    },
    {
      title: 'Customer Retention',
      value: `${analyticsData.customerRetention}%`,
      change: '+5%',
      period: 'vs last month',
      icon: '👥',
    },
  ]

  if (loading) {
    return <div className="p-8">Loading analytics...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Business insights and performance metrics</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Download Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsCards.map((card, index) => (
          <Card key={index} className="bg-card border-border/50 p-6 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{card.value}</p>
                <p className="text-xs text-primary font-semibold mt-2">{card.change} {card.period}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Bookings */}
        <Card className="bg-card border-border/50 p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Bookings by Hour</h2>
          <div className="space-y-4">
            {analyticsData.hourlyBookings.length > 0 ? (
              analyticsData.hourlyBookings.map((item: any, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground font-medium">{item.hour}:00</span>
                    <span className="text-xs font-semibold text-foreground">{item.bookings}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(item.bookings / Math.max(...analyticsData.hourlyBookings.map((h: any) => h.bookings))) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No bookings data available for today</p>
            )}
          </div>
        </Card>

        {/* Service Performance */}
        <Card className="bg-card border-border/50 p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Top Services by Revenue</h2>
          <div className="space-y-4">
            {analyticsData.servicePerformance.map((item: any, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.service_name}</p>
                  <p className="text-xs text-muted-foreground">{item.bookings} bookings</p>
                </div>
                <p className="text-sm font-bold text-primary">${item.revenue}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Salon Comparison */}
      <Card className="bg-card border-border/50 p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">Salon Performance Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/50 bg-secondary/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-foreground">Salon</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-foreground">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-foreground">Bookings</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-foreground">Performance</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.salonComparison.map((salon: any, index) => (
                <tr key={index} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-foreground">{salon.salon_name}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-primary">${salon.revenue}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{salon.bookings}</td>
                  <td className="px-4 py-4">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${(salon.revenue / Math.max(...analyticsData.salonComparison.map((s: any) => s.revenue))) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
