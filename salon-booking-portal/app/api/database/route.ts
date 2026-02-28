// Simple in-memory database for demo purposes
// In production, you would use a proper database like PostgreSQL or MySQL

interface Salon {
  id: number
  name: string
  address: string
  phone: string
  email: string
  status: string
  created_at: string
}

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
}

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

class InMemoryDatabase {
  private salons: Salon[] = []
  private services: Service[] = []
  private staff: Staff[] = []
  private bookings: Booking[] = []
  private offers: Offer[] = []
  private nextId = 1

  constructor() {
    this.initializeData()
  }

  private initializeData() {
    // Initialize sample data
    this.salons = [
      {
        id: 1,
        name: 'Main Salon',
        address: '123 Main St, City',
        phone: '+1234567890',
        email: 'main@salon.com',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]

    this.services = [
      {
        id: 1,
        salon_id: 1,
        name: 'Haircut',
        description: 'Professional haircut service',
        price: 30.00,
        duration: 30,
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        salon_id: 1,
        name: 'Hair Coloring',
        description: 'Full hair coloring service',
        price: 80.00,
        duration: 120,
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        salon_id: 1,
        name: 'Manicure',
        description: 'Professional manicure service',
        price: 25.00,
        duration: 45,
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]

    this.staff = [
      {
        id: 1,
        salon_id: 1,
        name: 'John Smith',
        email: 'john@salon.com',
        phone: '+1234567891',
        role: 'Hair Stylist',
        specialization: 'Hair Cutting & Coloring',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        salon_id: 1,
        name: 'Jane Doe',
        email: 'jane@salon.com',
        phone: '+1234567892',
        role: 'Nail Technician',
        specialization: 'Manicure & Pedicure',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]

    this.bookings = [
      {
        id: 1,
        salon_id: 1,
        service_id: 1,
        staff_id: 1,
        customer_name: 'Alice Johnson',
        customer_email: 'alice@email.com',
        customer_phone: '+1234567890',
        booking_date: '2024-01-15T10:00:00',
        status: 'confirmed',
        notes: 'Regular customer',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        salon_id: 1,
        service_id: 3,
        staff_id: 2,
        customer_name: 'Bob Smith',
        customer_email: 'bob@email.com',
        customer_phone: '+1234567891',
        booking_date: '2024-01-15T14:00:00',
        status: 'pending',
        notes: 'First time customer',
        created_at: new Date().toISOString()
      }
    ]

    this.offers = [
      {
        id: 1,
        salon_id: 1,
        title: 'New Year Special',
        description: '20% off on all services',
        discount_percentage: 20.00,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        salon_id: 1,
        title: 'Weekend Deal',
        description: '15% off on hair services',
        discount_percentage: 15.00,
        start_date: '2024-01-13',
        end_date: '2024-01-14',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]

    this.nextId = Math.max(
      ...this.salons.map(s => s.id),
      ...this.services.map(s => s.id),
      ...this.staff.map(s => s.id),
      ...this.bookings.map(b => b.id),
      ...this.offers.map(o => o.id)
    ) + 1
  }

  async init(): Promise<void> {
    // Database is already initialized
  }

  async all(query: string, params: any[] = []): Promise<any[]> {
    // Simple query parser for basic operations
    if (query.includes('salons')) {
      return this.salons
    } else if (query.includes('services')) {
      return this.services.map(service => ({
        ...service,
        salon_name: this.salons.find(s => s.id === service.salon_id)?.name
      }))
    } else if (query.includes('staff')) {
      return this.staff.map(staff => ({
        ...staff,
        salon_name: this.salons.find(s => s.id === staff.salon_id)?.name
      }))
    } else if (query.includes('bookings')) {
      return this.bookings.map(booking => ({
        ...booking,
        salon_name: this.salons.find(s => s.id === booking.salon_id)?.name,
        service_name: this.services.find(s => s.id === booking.service_id)?.name,
        service_price: this.services.find(s => s.id === booking.service_id)?.price,
        staff_name: this.staff.find(s => s.id === booking.staff_id)?.name
      }))
    } else if (query.includes('offers')) {
      return this.offers.map(offer => ({
        ...offer,
        salon_name: this.salons.find(s => s.id === offer.salon_id)?.name
      }))
    }
    return []
  }

  async get(query: string, params: any[] = []): Promise<any> {
    const table = this.getTableFromQuery(query)
    const id = params[0]
    
    if (table === 'salons') {
      return this.salons.find(s => s.id === id)
    } else if (table === 'services') {
      return this.services.find(s => s.id === id)
    } else if (table === 'staff') {
      return this.staff.find(s => s.id === id)
    } else if (table === 'bookings') {
      return this.bookings.find(b => b.id === id)
    } else if (table === 'offers') {
      return this.offers.find(o => o.id === id)
    }
    return null
  }

  async run(query: string, params: any[] = []): Promise<any> {
    const table = this.getTableFromQuery(query)
    
    if (query.includes('INSERT')) {
      return this.handleInsert(table, params)
    } else if (query.includes('UPDATE')) {
      return this.handleUpdate(table, params)
    } else if (query.includes('DELETE')) {
      return this.handleDelete(table, params)
    }
    
    return { changes: 0 }
  }

  private getTableFromQuery(query: string): string {
    if (query.includes('salons')) return 'salons'
    if (query.includes('services')) return 'services'
    if (query.includes('staff')) return 'staff'
    if (query.includes('bookings')) return 'bookings'
    if (query.includes('offers')) return 'offers'
    return ''
  }

  private handleInsert(table: string, params: any[]): any {
    const newItem = { id: this.nextId++, created_at: new Date().toISOString() }
    
    if (table === 'salons') {
      const [name, address, phone, email, status] = params
      this.salons.push({ ...newItem, name, address, phone, email, status })
    } else if (table === 'services') {
      const [salon_id, name, description, price, duration, status] = params
      this.services.push({ ...newItem, salon_id, name, description, price, duration, status })
    } else if (table === 'staff') {
      const [salon_id, name, email, phone, role, specialization, status] = params
      this.staff.push({ ...newItem, salon_id, name, email, phone, role, specialization, status })
    } else if (table === 'bookings') {
      const [salon_id, service_id, staff_id, customer_name, customer_email, customer_phone, booking_date, status, notes] = params
      this.bookings.push({ ...newItem, salon_id, service_id, staff_id, customer_name, customer_email, customer_phone, booking_date, status, notes })
    } else if (table === 'offers') {
      const [salon_id, title, description, discount_percentage, start_date, end_date, status] = params
      this.offers.push({ ...newItem, salon_id, title, description, discount_percentage, start_date, end_date, status })
    }
    
    return { changes: 1, lastID: this.nextId - 1 }
  }

  private handleUpdate(table: string, params: any[]): any {
    const id = params[params.length - 1]
    
    if (table === 'salons') {
      const [name, address, phone, email, status, , itemId] = params
      const index = this.salons.findIndex(s => s.id === itemId)
      if (index !== -1) {
        this.salons[index] = { ...this.salons[index], name, address, phone, email, status, updated_at: new Date().toISOString() }
      }
    } else if (table === 'services') {
      const [salon_id, name, description, price, duration, status, , itemId] = params
      const index = this.services.findIndex(s => s.id === itemId)
      if (index !== -1) {
        this.services[index] = { ...this.services[index], salon_id, name, description, price, duration, status, updated_at: new Date().toISOString() }
      }
    } else if (table === 'staff') {
      const [salon_id, name, email, phone, role, specialization, status, , itemId] = params
      const index = this.staff.findIndex(s => s.id === itemId)
      if (index !== -1) {
        this.staff[index] = { ...this.staff[index], salon_id, name, email, phone, role, specialization, status, updated_at: new Date().toISOString() }
      }
    } else if (table === 'bookings') {
      const [salon_id, service_id, staff_id, customer_name, customer_email, customer_phone, booking_date, status, notes, , itemId] = params
      const index = this.bookings.findIndex(b => b.id === itemId)
      if (index !== -1) {
        this.bookings[index] = { ...this.bookings[index], salon_id, service_id, staff_id, customer_name, customer_email, customer_phone, booking_date, status, notes, updated_at: new Date().toISOString() }
      }
    } else if (table === 'offers') {
      const [salon_id, title, description, discount_percentage, start_date, end_date, status, , itemId] = params
      const index = this.offers.findIndex(o => o.id === itemId)
      if (index !== -1) {
        this.offers[index] = { ...this.offers[index], salon_id, title, description, discount_percentage, start_date, end_date, status, updated_at: new Date().toISOString() }
      }
    }
    
    return { changes: 1 }
  }

  private handleDelete(table: string, params: any[]): any {
    const id = params[0]
    
    if (table === 'salons') {
      this.salons = this.salons.filter(s => s.id !== id)
    } else if (table === 'services') {
      this.services = this.services.filter(s => s.id !== id)
    } else if (table === 'staff') {
      this.staff = this.staff.filter(s => s.id !== id)
    } else if (table === 'bookings') {
      this.bookings = this.bookings.filter(b => b.id !== id)
    } else if (table === 'offers') {
      this.offers = this.offers.filter(o => o.id !== id)
    }
    
    return { changes: 1 }
  }

  close() {
    // No cleanup needed for in-memory database
  }
}

const db = new InMemoryDatabase()

export { db }

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')
    const table = searchParams.get('table')
    const query = searchParams.get('query')
    const params = JSON.parse(searchParams.get('params') || '[]')

    let result

    switch (operation) {
      case 'all':
        result = await db.all(query || `SELECT * FROM ${table}`, params)
        break
      case 'get':
        result = await db.get(query || `SELECT * FROM ${table} WHERE id = ?`, params)
        break
      default:
        result = { error: 'Invalid operation' }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Database GET error:', error)
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { operation, table, query, params } = await request.json()

    let result

    switch (operation) {
      case 'run':
        result = await db.run(query, params)
        break
      case 'all':
        result = await db.all(query, params)
        break
      case 'get':
        result = await db.get(query, params)
        break
      default:
        result = { error: 'Invalid operation' }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Database POST error:', error)
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  }
}
