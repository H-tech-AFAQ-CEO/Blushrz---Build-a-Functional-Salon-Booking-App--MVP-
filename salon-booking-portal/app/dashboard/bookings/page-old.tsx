'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/client-database'

interface Booking {
  id: number
  salon_id: number
  service_id: number
  staff_id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  booking_date: string
  status: string
  notes: string
  created_at: string
  service_name?: string
  service_price?: number
  staff_name?: string
  salon_name?: string
}

interface Salon {
  id: number
  name: string
}

interface Service {
  id: number
  name: string
  price: number
}

interface Staff {
  id: number
  name: string
}

export default function BookingsPage() {
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
  const [formData, setFormData] = useState({
    salon_id: 1,
    service_id: 1,
    staff_id: 1,
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    booking_date: '',
    status: 'pending',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [bookingsResult, salonsResult, servicesResult, staffResult] = await Promise.all([
        db.all(`
          SELECT b.*, s.name as salon_name, se.name as service_name, se.price as service_price, st.name as staff_name
          FROM bookings b
          JOIN salons s ON b.salon_id = s.id
          JOIN services se ON b.service_id = se.id
          JOIN staff st ON b.staff_id = st.id
          ORDER BY b.booking_date DESC
        `),
        db.all('SELECT id, name FROM salons WHERE status = "active"'),
        db.all('SELECT id, name, price FROM services WHERE status = "active"'),
        db.all('SELECT id, name FROM staff WHERE status = "active"')
      ])
      setBookings(bookingsResult)
      setSalons(salonsResult)
      setServices(servicesResult)
      setStaff(staffResult)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBooking) {
        await db.run(
          'UPDATE bookings SET salon_id = ?, service_id = ?, staff_id = ?, customer_name = ?, customer_email = ?, customer_phone = ?, booking_date = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [formData.salon_id, formData.service_id, formData.staff_id, formData.customer_name, formData.customer_email, formData.customer_phone, formData.booking_date, formData.status, formData.notes, editingBooking.id]
        )
      } else {
        await db.run(
          'INSERT INTO bookings (salon_id, service_id, staff_id, customer_name, customer_email, customer_phone, booking_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [formData.salon_id, formData.service_id, formData.staff_id, formData.customer_name, formData.customer_email, formData.customer_phone, formData.booking_date, formData.status, formData.notes]
        )
      }
      
      setFormData({ salon_id: 1, service_id: 1, staff_id: 1, customer_name: '', customer_email: '', customer_phone: '', booking_date: '', status: 'pending', notes: '' })
      setShowForm(false)
      setEditingBooking(null)
      loadData()
    } catch (error) {
      console.error('Error saving booking:', error)
    }
  }

  const handleEdit = (booking: any) => {
    setEditingBooking(booking)
    setFormData({
      salon_id: booking.salon_id,
      service_id: booking.service_id,
      staff_id: booking.staff_id,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_phone: booking.customer_phone,
      booking_date: booking.booking_date,
      status: booking.status,
      notes: booking.notes
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await db.run('DELETE FROM bookings WHERE id = ?', [id])
        loadData()
      } catch (error) {
        console.error('Error deleting booking:', error)
      }
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.staff_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesDate = !dateFilter || booking.booking_date.startsWith(dateFilter)
    return matchesSearch && matchesStatus && matchesDate
  })

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage all customer appointments</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          New Booking
        </Button>
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
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                  className="bg-secondary border-border/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Customer Email
                </label>
                <Input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="bg-secondary border-border/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Customer Phone
                </label>
                <Input
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="bg-secondary border-border/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Booking Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={formData.booking_date}
                  onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                  required
                  className="bg-secondary border-border/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Salon
                </label>
                <select
                  value={formData.salon_id}
                  onChange={(e) => setFormData({ ...formData, salon_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
                >
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
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
                >
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name} (${service.price})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Staff
                </label>
                <select
                  value={formData.staff_id}
                  onChange={(e) => setFormData({ ...formData, staff_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
                >
                  {staff.map(staffMember => (
                    <option key={staffMember.id} value={staffMember.id}>{staffMember.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
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
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {editingBooking ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingBooking(null)
                  setFormData({ salon_id: 1, service_id: 1, staff_id: 1, customer_name: '', customer_email: '', customer_phone: '', booking_date: '', status: 'pending', notes: '' })
                }}
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
              {filteredBookings.map((booking: any) => (
                <tr key={booking.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{booking.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{booking.service_name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{booking.staff_name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(booking.booking_date).toLocaleDateString()} • {new Date(booking.booking_date).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'confirmed'
                          ? 'bg-primary/20 text-primary'
                          : booking.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : booking.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">${booking.service_price || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        className="text-xs text-primary hover:text-primary/80"
                        onClick={() => handleEdit(booking)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="text-xs text-red-400 hover:text-red-500"
                        onClick={() => handleDelete(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No bookings found. Create your first booking to get started.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
