'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import apiService from '@/lib/api-service'
import realtimeService, { BookingUpdateEvent } from '@/lib/realtime-service'
import { toast } from 'sonner'

interface Booking {
  id: string
  salonId: string
  serviceId: string
  staffId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  bookingDate: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string
  createdAt: string
  updatedAt: string
  salon?: {
    id: string
    name: string
  }
  service?: {
    id: string
    name: string
    price: number
  }
  staff?: {
    id: string
    name: string
  }
}

interface Salon {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
  price: number
}

interface Staff {
  id: string
  name: string
}

export default function BookingsPage() {
  const { hasPermission } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [salons, setSalons] = useState<Salon[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    salonId: '',
    serviceId: '',
    staffId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: '',
    status: 'pending' as const,
    notes: ''
  })

  useEffect(() => {
    loadData()
    
    // Setup real-time updates
    const unsubscribeBookingCreated = realtimeService.on('booking.created', handleBookingUpdate)
    const unsubscribeBookingUpdated = realtimeService.on('booking.updated', handleBookingUpdate)
    const unsubscribeBookingCancelled = realtimeService.on('booking.cancelled', handleBookingUpdate)
    const unsubscribeBookingCompleted = realtimeService.on('booking.completed', handleBookingUpdate)

    // Connect to real-time service
    realtimeService.connect().catch(console.error)

    return () => {
      unsubscribeBookingCreated()
      unsubscribeBookingUpdated()
      unsubscribeBookingCancelled()
      unsubscribeBookingCompleted()
      realtimeService.disconnect()
    }
  }, [])

  const handleBookingUpdate = (event: BookingUpdateEvent) => {
    // Refresh bookings when real-time update is received
    loadData()
    
    // Show toast notification
    const action = event.type.split('.')[1] as string
    toast.success(`Booking ${action}: ${event.data.customerName} - ${event.data.serviceName}`)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [bookingsData, salonsData, servicesData, staffData] = await Promise.all([
        apiService.getBookings(),
        apiService.getSalons(),
        apiService.getServices(),
        apiService.getStaff()
      ])

      setBookings(bookingsData)
      setSalons(salonsData)
      setServices(servicesData)
      setStaff(staffData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasPermission('bookings.create')) {
      toast.error('You don\'t have permission to create bookings')
      return
    }

    setSubmitting(true)
    
    try {
      const bookingData = {
        ...formData,
        bookingDate: new Date(formData.bookingDate).toISOString(),
      }

      if (editingBooking) {
        await apiService.updateBooking(editingBooking.id, bookingData)
        toast.success('Booking updated successfully')
      } else {
        await apiService.createBooking(bookingData)
        toast.success('Booking created successfully')
      }
      
      resetForm()
      setShowForm(false)
      setEditingBooking(null)
      loadData()
    } catch (error) {
      console.error('Error saving booking:', error)
      toast.error('Failed to save booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (booking: Booking) => {
    if (!hasPermission('bookings.edit')) {
      toast.error('You don\'t have permission to edit bookings')
      return
    }

    setEditingBooking(booking)
    setFormData({
      salonId: booking.salonId,
      serviceId: booking.serviceId,
      staffId: booking.staffId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      bookingDate: booking.bookingDate,
      status: booking.status,
      notes: booking.notes
    })
    setShowForm(true)
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    if (!hasPermission('bookings.update_status')) {
      toast.error('You don\'t have permission to update booking status')
      return
    }

    try {
      await apiService.updateBookingStatus(bookingId, newStatus)
      toast.success('Booking status updated successfully')
      loadData()
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!hasPermission('bookings.delete')) {
      toast.error('You don\'t have permission to delete bookings')
      return
    }

    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      await apiService.deleteBooking(id)
      toast.success('Booking cancelled successfully')
      loadData()
    } catch (error) {
      console.error('Error deleting booking:', error)
      toast.error('Failed to cancel booking. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      salonId: '',
      serviceId: '',
      staffId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      bookingDate: '',
      status: 'pending',
      notes: ''
    })
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.staff?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesDate = !dateFilter || booking.bookingDate.startsWith(dateFilter)
    return matchesSearch && matchesStatus && matchesDate
  })

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage all customer appointments</p>
        </div>
        {hasPermission('bookings.create') && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            New Booking
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="bg-card border-border/50 p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {editingBooking ? 'Edit Booking' : 'New Booking'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Customer Name
                </label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                  className="bg-secondary border-border/50 text-foreground"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Customer Email
                </label>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="bg-secondary border-border/50 text-foreground"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Customer Phone
                </label>
                <Input
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="bg-secondary border-border/50 text-foreground"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Booking Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  required
                  className="bg-secondary border-border/50 text-foreground"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Salon
                </label>
                <select
                  value={formData.salonId}
                  onChange={(e) => setFormData({ ...formData, salonId: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
                  disabled={submitting}
                  required
                >
                  <option value="">Select a salon</option>
                  {salons.map(salon => (
                    <option key={salon.id} value={salon.id}>{salon.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Service
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
                  disabled={submitting}
                  required
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} (${service.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Staff
                </label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
                  disabled={submitting}
                  required
                >
                  <option value="">Select staff member</option>
                  {staff.map(staffMember => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
                  disabled={submitting}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
                disabled={submitting}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {submitting ? 'Saving...' : (editingBooking ? 'Update' : 'Create')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingBooking(null)
                  resetForm()
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by client, service, or staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-secondary border border-border/50 rounded-lg text-foreground text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 bg-secondary border border-border/50 rounded-lg text-foreground text-sm"
        />
      </div>

      {/* Bookings Table */}
      <Card className="bg-card border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/50 bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Client</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Service</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Price</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{booking.customerName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{booking.service?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{booking.staff?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(booking.bookingDate).toLocaleDateString()} • {new Date(booking.bookingDate).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    ${booking.service?.price || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {hasPermission('bookings.edit') && (
                        <Button 
                          variant="ghost" 
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={() => handleEdit(booking)}
                        >
                          Edit
                        </Button>
                      )}
                      {hasPermission('bookings.update_status') && (
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                          className="text-xs px-2 py-1 bg-secondary border border-border/50 rounded text-foreground"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                      {hasPermission('bookings.delete') && (
                        <Button 
                          variant="ghost" 
                          className="text-xs text-red-400 hover:text-red-500"
                          onClick={() => handleDelete(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No bookings found matching your criteria.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
