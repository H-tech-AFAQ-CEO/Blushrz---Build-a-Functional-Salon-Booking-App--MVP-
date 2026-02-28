import sqlite3 from 'sqlite3'
import { promisify } from 'util'

const DB_PATH = './database.sqlite'

class Database {
  private db: sqlite3.Database

  constructor() {
    this.db = new sqlite3.Database(DB_PATH)
  }

  async init() {
    const run = promisify(this.db.run.bind(this.db))

    // Create tables
    await run(`
      CREATE TABLE IF NOT EXISTS salons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await run(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        salon_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        duration INTEGER,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (salon_id) REFERENCES salons (id)
      )
    `)

    await run(`
      CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        salon_id INTEGER,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        role TEXT,
        specialization TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (salon_id) REFERENCES salons (id)
      )
    `)

    await run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        salon_id INTEGER,
        service_id INTEGER,
        staff_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT,
        booking_date DATETIME NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (salon_id) REFERENCES salons (id),
        FOREIGN KEY (service_id) REFERENCES services (id),
        FOREIGN KEY (staff_id) REFERENCES staff (id)
      )
    `)

    await run(`
      CREATE TABLE IF NOT EXISTS offers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        salon_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        discount_percentage REAL,
        start_date DATE,
        end_date DATE,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (salon_id) REFERENCES salons (id)
      )
    `)

    // Insert sample data
    await this.insertSampleData()
  }

  private async insertSampleData() {
    const run = promisify(this.db.run.bind(this.db))

    try {
      // Insert sample salon
      await run(`
        INSERT OR IGNORE INTO salons (id, name, address, phone, email) 
        VALUES (1, 'Main Salon', '123 Main St, City', '+1234567890', 'main@salon.com')
      `)

      // Insert sample services
      await run(`
        INSERT OR IGNORE INTO services (id, salon_id, name, description, price, duration) 
        VALUES 
          (1, 1, 'Haircut', 'Professional haircut service', 30.00, 30),
          (2, 1, 'Hair Coloring', 'Full hair coloring service', 80.00, 120),
          (3, 1, 'Manicure', 'Professional manicure service', 25.00, 45)
      `)

      // Insert sample staff
      await run(`
        INSERT OR IGNORE INTO staff (id, salon_id, name, email, phone, role, specialization) 
        VALUES 
          (1, 1, 'John Smith', 'john@salon.com', '+1234567891', 'Hair Stylist', 'Hair Cutting & Coloring'),
          (2, 1, 'Jane Doe', 'jane@salon.com', '+1234567892', 'Nail Technician', 'Manicure & Pedicure')
      `)

      // Insert sample bookings
      await run(`
        INSERT OR IGNORE INTO bookings (id, salon_id, service_id, staff_id, customer_name, customer_email, booking_date, status) 
        VALUES 
          (1, 1, 1, 1, 'Alice Johnson', 'alice@email.com', '2024-01-15 10:00:00', 'confirmed'),
          (2, 1, 3, 2, 'Bob Smith', 'bob@email.com', '2024-01-15 14:00:00', 'pending')
      `)

      // Insert sample offers
      await run(`
        INSERT OR IGNORE INTO offers (id, salon_id, title, description, discount_percentage, start_date, end_date) 
        VALUES 
          (1, 1, 'New Year Special', '20% off on all services', 20.00, '2024-01-01', '2024-01-31'),
          (2, 1, 'Weekend Deal', '15% off on hair services', 15.00, '2024-01-13', '2024-01-14')
      `)
    } catch (error) {
      console.log('Sample data already exists')
    }
  }

  // Generic query methods
  async all(query: string, params: any[] = []): Promise<any[]> {
    const all = promisify(this.db.all.bind(this.db))
    return all(query, params)
  }

  async get(query: string, params: any[] = []): Promise<any> {
    const get = promisify(this.db.get.bind(this.db))
    return get(query, params)
  }

  async run(query: string, params: any[] = []): Promise<any> {
    const run = promisify(this.db.run.bind(this.db))
    return run(query, params)
  }

  close() {
    this.db.close()
  }
}

export const db = new Database()
