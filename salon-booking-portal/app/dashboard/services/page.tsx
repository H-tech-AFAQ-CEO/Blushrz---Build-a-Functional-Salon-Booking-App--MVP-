'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/client-database'

interface Service {
  id: number
  salon_id: number
  name: string
  description: string
  price: number
  duration: number
  status: string
  created_at: string
}

interface Salon {
  id: number
  name: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    salon_id: 1,
    name: '',
    description: '',
    price: '',
    duration: '',
    status: 'active'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [servicesResult, salonsResult] = await Promise.all([
        db.all('SELECT * FROM services ORDER BY created_at DESC'),
        db.all('SELECT id, name FROM salons WHERE status = "active"')
      ])
      setServices(servicesResult)
      setSalons(salonsResult)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingService) {
        await db.run(
          'UPDATE services SET salon_id = ?, name = ?, description = ?, price = ?, duration = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [formData.salon_id, formData.name, formData.description, parseFloat(formData.price), parseInt(formData.duration), formData.status, editingService.id]
        )
      } else {
        await db.run(
          'INSERT INTO services (salon_id, name, description, price, duration, status) VALUES (?, ?, ?, ?, ?, ?)',
          [formData.salon_id, formData.name, formData.description, parseFloat(formData.price), parseInt(formData.duration), formData.status]
        )
      }
      
      setFormData({ salon_id: 1, name: '', description: '', price: '', duration: '', status: 'active' })
      setShowForm(false)
      setEditingService(null)
      loadData()
    } catch (error) {
      console.error('Error saving service:', error)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      salon_id: service.salon_id,
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      status: service.status
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await db.run('DELETE FROM services WHERE id = ?', [id])
        loadData()
      } catch (error) {
        console.error('Error deleting service:', error)
      }
    }
  }

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground mt-1">Manage all available services</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Add New Service
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="bg-card border-border/50 p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Service Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  Price ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="bg-secondary border-border/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                  className="bg-secondary border-border/50 text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
              />
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {editingService ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingService(null)
                  setFormData({ salon_id: 1, name: '', description: '', price: '', duration: '', status: 'active' })
                }}
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
          placeholder="Search services..."
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

      {/* Services Table */}
      <Card className="bg-card border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/50 bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Service Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Description</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Price</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{service.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{service.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{service.duration} min</td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary">${service.price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        service.status === 'active'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        className="text-xs text-primary hover:text-primary/80"
                        onClick={() => handleEdit(service)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="text-xs text-red-400 hover:text-red-500"
                        onClick={() => handleDelete(service.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredServices.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No services found. Add your first service to get started.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
