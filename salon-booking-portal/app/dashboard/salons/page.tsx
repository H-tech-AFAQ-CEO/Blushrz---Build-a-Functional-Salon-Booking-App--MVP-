'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'
import apiService from '@/lib/api-service'
import realtimeService, { SalonUpdateEvent } from '@/lib/realtime-service'
import { toast } from 'sonner'

interface Salon {
  id: string
  name: string
  address: string
  phone: string
  email: string
  status: 'active' | 'inactive'
  waitingTime?: string
  homeServiceAvailable?: boolean
  rating?: number
  totalBookings?: number
  createdAt: string
  updatedAt: string
}

export default function SalonsPage() {
  const { hasPermission } = useAuth()
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
    waitingTime: '',
    homeServiceAvailable: false
  })

  useEffect(() => {
    loadSalons()
    
    // Setup real-time updates
    const unsubscribeSalonUpdated = realtimeService.on('salon.updated', handleSalonUpdate)
    const unsubscribeStatusChanged = realtimeService.on('salon.status_changed', handleSalonUpdate)

    // Connect to real-time service
    realtimeService.connect().catch(console.error)

    return () => {
      unsubscribeSalonUpdated()
      unsubscribeStatusChanged()
      realtimeService.disconnect()
    }
  }, [])

  const handleSalonUpdate = (event: SalonUpdateEvent) => {
    // Refresh salons when real-time update is received
    loadSalons()
    
    // Show toast notification
    toast.success(`Salon updated: ${event.data.name}`)
  }

  const loadSalons = async () => {
    try {
      setLoading(true)
      const params = statusFilter !== 'all' ? { status: statusFilter } : {}
      const data = await apiService.getSalons(params)
      setSalons(data as Salon[])
    } catch (error) {
      console.error('Error loading salons:', error)
      toast.error('Failed to load salons. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasPermission('salons.create') && !editingSalon) {
      toast.error('You don\'t have permission to create salons')
      return
    }
    
    if (!hasPermission('salons.edit') && editingSalon) {
      toast.error('You don\'t have permission to edit salons')
      return
    }

    setSubmitting(true)
    
    try {
      const salonData = {
        ...formData,
        waitingTime: formData.waitingTime || null,
      }

      if (editingSalon) {
        await apiService.updateSalon(editingSalon.id, salonData)
        toast.success('Salon updated successfully')
      } else {
        await apiService.createSalon(salonData)
        toast.success('Salon created successfully')
      }
      
      resetForm()
      setShowForm(false)
      setEditingSalon(null)
      loadSalons()
    } catch (error) {
      console.error('Error saving salon:', error)
      toast.error('Failed to save salon. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (salon: Salon) => {
    if (!hasPermission('salons.edit')) {
      toast.error('You don\'t have permission to edit salons')
      return
    }

    setEditingSalon(salon)
    setFormData({
      name: salon.name,
      address: salon.address,
      phone: salon.phone,
      email: salon.email,
      status: salon.status,
      waitingTime: salon.waitingTime || '',
      homeServiceAvailable: salon.homeServiceAvailable || false
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!hasPermission('salons.delete')) {
      toast.error('You don\'t have permission to delete salons')
      return
    }

    if (!confirm('Are you sure you want to delete this salon? This action cannot be undone.')) {
      return
    }

    try {
      await apiService.deleteSalon(id)
      toast.success('Salon deleted successfully')
      loadSalons()
    } catch (error) {
      console.error('Error deleting salon:', error)
      toast.error('Failed to delete salon. Please try again.')
    }
  }

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    if (!hasPermission('salons.update_status')) {
      toast.error('You don\'t have permission to update salon status')
      return
    }

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    try {
      await apiService.updateSalonStatus(id, newStatus)
      toast.success(`Salon ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      loadSalons()
    } catch (error) {
      console.error('Error updating salon status:', error)
      toast.error('Failed to update salon status. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      status: 'active',
      waitingTime: '',
      homeServiceAvailable: false
    })
  }

  const filteredSalons = salons.filter(salon => 
    salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salon.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
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
          <h1 className="text-3xl font-bold text-foreground">Salons</h1>
          <p className="text-muted-foreground mt-1">Manage your salon locations</p>
        </div>
        {hasPermission('salons.create') && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Add New Salon
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="bg-card border-border/50 p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {editingSalon ? 'Edit Salon' : 'Add New Salon'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Salon Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-secondary border-border/50 text-foreground"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-secondary border-border/50 text-foreground"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-secondary border-border/50 text-foreground"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
                  disabled={submitting}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Waiting Time (minutes)
                </label>
                <Input
                  value={formData.waitingTime}
                  onChange={(e) => setFormData({ ...formData, waitingTime: e.target.value })}
                  placeholder="e.g., 15"
                  className="bg-secondary border-border/50 text-foreground"
                  disabled={submitting}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="home-service"
                  checked={formData.homeServiceAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, homeServiceAvailable: checked })}
                  disabled={submitting}
                />
                <label htmlFor="home-service" className="text-sm font-medium text-foreground">
                  Home Service Available
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
                disabled={submitting}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {submitting ? 'Saving...' : (editingSalon ? 'Update' : 'Create')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingSalon(null)
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

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search salons..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Salons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSalons.map((salon) => (
          <Card
            key={salon.id}
            className="bg-card border-border/50 p-6 hover:border-primary/50 transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{salon.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">📍 {salon.address}</p>
              </div>
              <Badge className={getStatusColor(salon.status)}>
                {salon.status}
              </Badge>
            </div>

            <div className="space-y-2 py-4 border-y border-border/30">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">📞</span>
                <span className="text-sm text-foreground">{salon.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">✉️</span>
                <span className="text-sm text-foreground">{salon.email || 'Not provided'}</span>
              </div>
              {salon.waitingTime && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">⏱️</span>
                  <span className="text-sm text-foreground">{salon.waitingTime} min wait</span>
                </div>
              )}
              {salon.homeServiceAvailable && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">🏠</span>
                  <span className="text-sm text-foreground">Home service available</span>
                </div>
              )}
              {salon.rating && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">⭐</span>
                  <span className="text-sm text-foreground">{salon.rating.toFixed(1)} rating</span>
                </div>
              )}
              {salon.totalBookings !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">📅</span>
                  <span className="text-sm text-foreground">{salon.totalBookings} bookings</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              {hasPermission('salons.edit') && (
                <Button 
                  variant="outline" 
                  className="flex-1 text-sm border-border/50 text-foreground hover:bg-secondary"
                  onClick={() => handleEdit(salon)}
                >
                  Edit
                </Button>
              )}
              {hasPermission('salons.update_status') && (
                <Button 
                  variant="outline"
                  className="flex-1 text-sm border-border/50 text-foreground hover:bg-secondary"
                  onClick={() => handleStatusToggle(salon.id, salon.status)}
                >
                  {salon.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              )}
              {hasPermission('salons.delete') && (
                <Button 
                  variant="outline"
                  className="flex-1 text-sm border-border/50 text-red-400 hover:text-red-300 hover:bg-secondary"
                  onClick={() => handleDelete(salon.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredSalons.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No salons found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
