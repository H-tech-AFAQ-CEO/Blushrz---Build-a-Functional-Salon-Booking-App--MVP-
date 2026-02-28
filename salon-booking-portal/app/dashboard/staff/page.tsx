'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/client-database'

interface Staff {
  id: number
  salon_id: number
  name: string
  email: string
  phone: string
  role: string
  specialization: string
  status: string
  created_at: string
}

interface Salon {
  id: number
  name: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    salon_id: 1,
    name: '',
    email: '',
    phone: '',
    role: '',
    specialization: '',
    status: 'active'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [staffResult, salonsResult] = await Promise.all([
        db.all('SELECT * FROM staff ORDER BY created_at DESC'),
        db.all('SELECT id, name FROM salons WHERE status = "active"')
      ])
      setStaff(staffResult)
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
      if (editingStaff) {
        await db.run(
          'UPDATE staff SET salon_id = ?, name = ?, email = ?, phone = ?, role = ?, specialization = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [formData.salon_id, formData.name, formData.email, formData.phone, formData.role, formData.specialization, formData.status, editingStaff.id]
        )
      } else {
        await db.run(
          'INSERT INTO staff (salon_id, name, email, phone, role, specialization, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [formData.salon_id, formData.name, formData.email, formData.phone, formData.role, formData.specialization, formData.status]
        )
      }
      
      setFormData({ salon_id: 1, name: '', email: '', phone: '', role: '', specialization: '', status: 'active' })
      setShowForm(false)
      setEditingStaff(null)
      loadData()
    } catch (error) {
      console.error('Error saving staff:', error)
    }
  }

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setFormData({
      salon_id: staffMember.salon_id,
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      specialization: staffMember.specialization,
      status: staffMember.status
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        await db.run('DELETE FROM staff WHERE id = ?', [id])
        loadData()
      } catch (error) {
        console.error('Error deleting staff:', error)
      }
    }
  }

  const filteredStaff = staff.filter(staffMember => 
    staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Members</h1>
          <p className="text-muted-foreground mt-1">Manage your team across all salons</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Add Staff Member
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="bg-card border-border/50 p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name
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
                  Role
                </label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="bg-secondary border-border/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Specialization
                </label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="bg-secondary border-border/50 text-foreground"
                />
              </div>
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
                {editingStaff ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingStaff(null)
                  setFormData({ salon_id: 1, name: '', email: '', phone: '', role: '', specialization: '', status: 'active' })
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
        placeholder="Search staff by name, role, or specialization..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
      />

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStaff.map((staffMember) => (
          <Card
            key={staffMember.id}
            className="bg-card border-border/50 p-5 hover:border-primary/50 transition-all hover:shadow-lg"
          >
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary">{staffMember.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{staffMember.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{staffMember.role}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 pb-4 border-b border-border/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground font-medium truncate ml-2">{staffMember.email || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span className="text-foreground font-medium">{staffMember.phone || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Specialization</span>
                <span className="text-foreground font-medium truncate ml-2">{staffMember.specialization || '-'}</span>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="space-y-3">
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  staffMember.status === 'active'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {staffMember.status}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 text-xs border-border/50 text-foreground hover:bg-secondary"
                  onClick={() => handleEdit(staffMember)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 text-xs border-border/50 text-red-400 hover:text-red-300 hover:bg-secondary"
                  onClick={() => handleDelete(staffMember.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No staff members found. Add your first staff member to get started.</p>
        </div>
      )}
    </div>
  )
}
