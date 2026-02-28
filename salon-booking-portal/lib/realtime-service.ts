import { io, Socket } from 'socket.io-client'
import apiService from './api-service'

// Environment configuration
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.blushrz.com'

export interface RealtimeEvent {
  type: string
  data: any
  timestamp: string
}

export interface BookingUpdateEvent extends RealtimeEvent {
  type: 'booking.created' | 'booking.updated' | 'booking.cancelled' | 'booking.completed'
  data: {
    id: string
    salonId: string
    status: string
    customerName: string
    serviceName: string
    staffName: string
    bookingDate: string
  }
}

export interface SalonUpdateEvent extends RealtimeEvent {
  type: 'salon.status_changed' | 'salon.updated'
  data: {
    id: string
    name: string
    status: string
    waitingTime?: string
    homeServiceAvailable?: boolean
  }
}

export interface PaymentUpdateEvent extends RealtimeEvent {
  type: 'payment.completed' | 'payment.failed' | 'payment.refunded'
  data: {
    id: string
    bookingId: string
    amount: number
    status: string
    customerEmail: string
  }
}

export interface UserUpdateEvent extends RealtimeEvent {
  type: 'user.registered' | 'user.updated'
  data: {
    id: string
    name: string
    email: string
    phone: string
  }
}

type EventCallback<T = any> = (event: T) => void

class RealtimeService {
  private socket: Socket | null = null
  private isConnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  
  // Event listeners
  private listeners: Map<string, Set<EventCallback>> = new Map()

  constructor() {
    this.setupEventListeners()
  }

  // Connection management
  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return
    }

    this.isConnecting = true

    try {
      const token = this.getAuthToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      this.socket = io(WS_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      })

      this.setupSocketListeners()
      
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 10000)

        this.socket!.once('connect', () => {
          clearTimeout(timeout)
          this.isConnecting = false
          this.reconnectAttempts = 0
          console.log('Connected to real-time server')
          resolve()
        })

        this.socket!.once('connect_error', (error: any) => {
          clearTimeout(timeout)
          this.isConnecting = false
          reject(error)
        })
      })
    } catch (error) {
      this.isConnecting = false
      throw error
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.listeners.clear()
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    
    // Try to get token from cookies or localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1]
    
    return token || localStorage.getItem('admin_token')
  }

  private setupSocketListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Real-time connection established')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason: any) => {
      console.log('Real-time connection disconnected:', reason)
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        this.disconnect()
      }
    })

    this.socket.on('connect_error', (error: any) => {
      console.error('Real-time connection error:', error)
      this.isConnecting = false
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.disconnect()
      }
    })

    this.socket.on('reconnect_attempt', (attemptNumber: any) => {
      console.log(`Attempting to reconnect (${attemptNumber}/${this.maxReconnectAttempts})`)
    })

    this.socket.on('reconnect', (attemptNumber: any) => {
      console.log(`Successfully reconnected after ${attemptNumber} attempts`)
    })

    // Setup event listeners for different types
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    if (!this.socket) return

    // Booking events
    this.socket.on('booking.created', (event: BookingUpdateEvent) => {
      this.emit('booking.created', event)
    })

    this.socket.on('booking.updated', (event: BookingUpdateEvent) => {
      this.emit('booking.updated', event)
    })

    this.socket.on('booking.cancelled', (event: BookingUpdateEvent) => {
      this.emit('booking.cancelled', event)
    })

    this.socket.on('booking.completed', (event: BookingUpdateEvent) => {
      this.emit('booking.completed', event)
    })

    // Salon events
    this.socket.on('salon.status_changed', (event: SalonUpdateEvent) => {
      this.emit('salon.status_changed', event)
    })

    this.socket.on('salon.updated', (event: SalonUpdateEvent) => {
      this.emit('salon.updated', event)
    })

    // Payment events
    this.socket.on('payment.completed', (event: PaymentUpdateEvent) => {
      this.emit('payment.completed', event)
    })

    this.socket.on('payment.failed', (event: PaymentUpdateEvent) => {
      this.emit('payment.failed', event)
    })

    this.socket.on('payment.refunded', (event: PaymentUpdateEvent) => {
      this.emit('payment.refunded', event)
    })

    // User events
    this.socket.on('user.registered', (event: UserUpdateEvent) => {
      this.emit('user.registered', event)
    })

    this.socket.on('user.updated', (event: UserUpdateEvent) => {
      this.emit('user.updated', event)
    })

    // System events
    this.socket.on('system.maintenance', (event: RealtimeEvent) => {
      this.emit('system.maintenance', event)
    })

    this.socket.on('system.announcement', (event: RealtimeEvent) => {
      this.emit('system.announcement', event)
    })
  }

  private setupEventListeners(): void {
    // This method can be used to setup any additional event listeners
    // that need to be configured when the service is initialized
  }

  // Event management
  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    
    this.listeners.get(event)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(event)
        }
      }
    }
  }

  private emit<T = any>(event: string, data: T): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error)
        }
      })
    }
  }

  // Room management (for specific salon updates)
  async joinSalonRoom(salonId: string): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect()
    }
    
    this.socket?.emit('join_salon', { salonId })
  }

  async leaveSalonRoom(salonId: string): Promise<void> {
    this.socket?.emit('leave_salon', { salonId })
  }

  // Admin-specific rooms
  async joinAdminRoom(): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect()
    }
    
    this.socket?.emit('join_admin')
  }

  async leaveAdminRoom(): Promise<void> {
    this.socket?.emit('leave_admin')
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting'
    if (this.socket?.connected) return 'connected'
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return 'error'
    return 'disconnected'
  }

  // Manual reconnection
  async reconnect(): Promise<void> {
    this.disconnect()
    await this.connect()
  }

  // Send custom events (if needed)
  send(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('Cannot send event: not connected to real-time server')
    }
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService()
export default realtimeService
