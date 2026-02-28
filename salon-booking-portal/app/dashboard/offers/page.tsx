'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/client-database'

interface Offer {
  id: number
  salon_id: number
  title: string
  description: string
  discount_percentage: number
  start_date: string
  end_date: string
  status: string
  created_at: string
}

interface Salon {
  id: number
  name: string
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    salon_id: 1,
    title: '',
    description: '',
    discount_percentage: '',
    start_date: '',
    end_date: '',
    status: 'active'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [offersResult, salonsResult] = await Promise.all([
        db.all(`
          SELECT o.*, s.name as salon_name
          FROM offers o
          JOIN salons s ON o.salon_id = s.id
          ORDER BY o.created_at DESC
        `),
        db.all('SELECT id, name FROM salons WHERE status = "active"')
      ])
      setOffers(offersResult)
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
      if (editingOffer) {
        await db.run(
          'UPDATE offers SET salon_id = ?, title = ?, description = ?, discount_percentage = ?, start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [formData.salon_id, formData.title, formData.description, parseFloat(formData.discount_percentage), formData.start_date, formData.end_date, formData.status, editingOffer.id]
        )
      } else {
        await db.run(
          'INSERT INTO offers (salon_id, title, description, discount_percentage, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [formData.salon_id, formData.title, formData.description, parseFloat(formData.discount_percentage), formData.start_date, formData.end_date, formData.status]
        )
      }
      
      setFormData({ salon_id: 1, title: '', description: '', discount_percentage: '', start_date: '', end_date: '', status: 'active' })
      setShowForm(false)
      setEditingOffer(null)
      loadData()
    } catch (error) {
      console.error('Error saving offer:', error)
    }
  }

  const handleEdit = (offer: any) => {
    setEditingOffer(offer)
    setFormData({
      salon_id: offer.salon_id,
      title: offer.title,
      description: offer.description,
      discount_percentage: offer.discount_percentage.toString(),
      start_date: offer.start_date,
      end_date: offer.end_date,
      status: offer.status
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      try {
        await db.run('DELETE FROM offers WHERE id = ?', [id])
        loadData()
      } catch (error) {
        console.error('Error deleting offer:', error)
      }
    }
  }

  const filteredOffers = offers.filter(offer => 
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Promotional Offers</h1>
          <p className="text-muted-foreground mt-1">Create and manage promotional campaigns</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Create Offer
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="bg-card border-border/50 p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {editingOffer ? 'Edit Offer' : 'Create New Offer'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Offer Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-secondary border-border/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discount Percentage
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  required
                  className="bg-secondary border-border/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="bg-secondary border-border/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-secondary border border-border/50 rounded text-foreground"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {editingOffer ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingOffer(null)
                  setFormData({ salon_id: 1, title: '', description: '', discount_percentage: '', start_date: '', end_date: '', status: 'active' })
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search */}
      <Input
        placeholder="Search offers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
      />

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer: any) => (
          <Card
            key={offer.id}
            className="bg-card border-border/50 p-6 hover:border-primary/50 transition-all hover:shadow-lg"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{offer.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{offer.description}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                  offer.status === 'active'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {offer.status}
              </span>
            </div>

            {/* Discount Badge */}
            <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-2xl font-bold text-primary">{offer.discount_percentage}% OFF</p>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 pb-4 border-b border-border/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Salon</span>
                <span className="text-foreground font-medium">{offer.salon_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start Date</span>
                <span className="text-foreground font-medium">{offer.start_date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">End Date</span>
                <span className="text-foreground font-medium">{offer.end_date}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 text-sm border-border/50 text-foreground hover:bg-secondary"
                onClick={() => handleEdit(offer)}
              >
                Edit
              </Button>
              <Button 
                variant="outline"
                className="flex-1 text-sm border-border/50 text-red-400 hover:text-red-300 hover:bg-secondary"
                onClick={() => handleDelete(offer.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredOffers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No offers found. Create your first offer to get started.</p>
        </div>
      )}
    </div>
  )
}
