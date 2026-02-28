'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/client-database'

interface Salon {
  id: number
  name: string
  address: string
  phone: string
  email: string
  status: string
  created_at: string
}

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    status: 'active'
  })

  useEffect(() => {
    loadSalons()
  }, [])

  const loadSalons = async () => {
    try {
      let query = 'SELECT * FROM salons'
      const params: any[] = []
      
      if (statusFilter !== 'all') {
        query += ' WHERE status = ?'
        params.push(statusFilter)
      }
      
      query += ' ORDER BY created_at DESC'
      
      const result = await db.all(query, params)
      setSalons(result)
    } catch (error) {
      console.error('Error loading salons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSalon) {
        await db.run(
          'UPDATE salons SET name = ?, address = ?, phone = ?, email = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [formData.name, formData.address, formData.phone, formData.email, formData.status, editingSalon.id]
        )
      } else {
        await db.run(
          'INSERT INTO salons (name, address, phone, email, status) VALUES (?, ?, ?, ?, ?)',
          [formData.name, formData.address, formData.phone, formData.email, formData.status]
        )
      }
      
      setFormData({ name: '', address: '', phone: '', email: '', status: 'active' })
      setShowForm(false)
      setEditingSalon(null)
      loadSalons()
    } catch (error) {
      console.error('Error saving salon:', error)
    }
  }

  const handleEdit = (salon: Salon) => {
    setEditingSalon(salon)
    setFormData({
      name: salon.name,
      address: salon.address,
      phone: salon.phone,
      email: salon.email,
      status: salon.status
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this salon?')) {
      try {
        await db.run('DELETE FROM salons WHERE id = ?', [id])
        loadSalons()
      } catch (error) {
        console.error('Error deleting salon:', error)
      }
    }
  }

  const filteredSalons = salons.filter(salon => 
    salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salon.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Salons</h1>
          <p className="text-muted-foreground mt-1">Manage your salon locations</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Add New Salon
        </Button>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-secondary border-border/50 text-foreground"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {editingSalon ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingSalon(null)
                  setFormData({ name: '', address: '', phone: '', email: '', status: 'active' })
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
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  salon.status === 'active'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {salon.status}
              </span>
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
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                className="flex-1 text-sm border-border/50 text-foreground hover:bg-secondary"
                onClick={() => handleEdit(salon)}
              >
                Edit
              </Button>
              <Button 
                variant="outline"
                className="flex-1 text-sm border-border/50 text-red-400 hover:text-red-300 hover:bg-secondary"
                onClick={() => handleDelete(salon.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredSalons.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No salons found. Add your first salon to get started.</p>
        </div>
      )}
    </div>
  )
}
