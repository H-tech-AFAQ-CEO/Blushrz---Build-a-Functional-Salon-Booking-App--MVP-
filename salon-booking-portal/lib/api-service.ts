import axios, { AxiosInstance, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.blushrz.com/api'
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENV || 'production'

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/admin/login',
    LOGOUT: '/auth/admin/logout',
    REFRESH: '/auth/admin/refresh',
    ME: '/auth/admin/me',
  },
  SALONS: {
    LIST: '/admin/salons',
    CREATE: '/admin/salons',
    UPDATE: '/admin/salons',
    DELETE: '/admin/salons',
    GET: (id: string) => `/admin/salons/${id}`,
    SERVICES: (id: string) => `/admin/salons/${id}/services`,
    STAFF: (id: string) => `/admin/salons/${id}/staff`,
    AVAILABILITY: (id: string) => `/admin/salons/${id}/availability`,
    UPDATE_STATUS: (id: string) => `/admin/salons/${id}/status`,
  },
  SERVICES: {
    LIST: '/admin/services',
    CREATE: '/admin/services',
    UPDATE: '/admin/services',
    DELETE: '/admin/services',
    GET: (id: string) => `/admin/services/${id}`,
  },
  STAFF: {
    LIST: '/admin/staff',
    CREATE: '/admin/staff',
    UPDATE: '/admin/staff',
    DELETE: '/admin/staff',
    GET: (id: string) => `/admin/staff/${id}`,
  },
  BOOKINGS: {
    LIST: '/admin/bookings',
    CREATE: '/admin/bookings',
    UPDATE: '/admin/bookings',
    DELETE: '/admin/bookings',
    GET: (id: string) => `/admin/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/admin/bookings/${id}/status`,
    BY_DATE: '/admin/bookings/by-date',
    BY_SALON: (id: string) => `/admin/bookings/salon/${id}`,
  },
  USERS: {
    LIST: '/admin/users',
    GET: (id: string) => `/admin/users/${id}`,
    UPDATE: (id: string) => `/admin/users/${id}`,
    FAVORITES: (id: string) => `/admin/users/${id}/favorites`,
  },
  PAYMENTS: {
    LIST: '/admin/payments',
    GET: (id: string) => `/admin/payments/${id}`,
    REFUND: (id: string) => `/admin/payments/${id}/refund`,
    WEBHOOK_LOGS: '/admin/payments/webhook-logs',
  },
  ANALYTICS: {
    OVERVIEW: '/admin/analytics/overview',
    BOOKINGS: '/admin/analytics/bookings',
    REVENUE: '/admin/analytics/revenue',
    SALONS: '/admin/analytics/salons',
    SERVICES: '/admin/analytics/services',
    USERS: '/admin/analytics/users',
    EXPORT: '/admin/analytics/export',
  },
  NOTIFICATIONS: {
    LIST: '/admin/notifications',
    CREATE: '/admin/notifications',
    SEND: '/admin/notifications/send',
    UPDATE: (id: string) => `/admin/notifications/${id}`,
    DELETE: (id: string) => `/admin/notifications/${id}`,
  },
  OFFERS: {
    LIST: '/admin/offers',
    CREATE: '/admin/offers',
    UPDATE: '/admin/offers',
    DELETE: '/admin/offers',
    GET: (id: string) => `/admin/offers/${id}`,
  },
}

// Token management
const TOKEN_KEY = 'admin_token'
const REFRESH_TOKEN_KEY = 'admin_refresh_token'

class ApiService {
  private api: AxiosInstance
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - Handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const newToken = await this.refreshToken()
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return this.api(originalRequest)
          } catch (refreshError) {
            this.logout()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Token management
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return
    Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' })
    localStorage.setItem(TOKEN_KEY, token)
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return Cookies.get(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 30, secure: true, sameSite: 'strict' })
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performTokenRefresh()
    
    try {
      const token = await this.refreshPromise
      return token
    } finally {
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken },
        { timeout: 10000 }
      )

      const { token, refreshToken: newRefreshToken } = response.data
      this.setToken(token)
      if (newRefreshToken) {
        this.setRefreshToken(newRefreshToken)
      }

      return token
    } catch (error) {
      this.clearTokens()
      throw error
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    try {
      const response: AxiosResponse = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      })

      const { token, refreshToken, user } = response.data
      this.setToken(token)
      if (refreshToken) {
        this.setRefreshToken(refreshToken)
      }

      return { user, token }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async logout() {
    try {
      await this.api.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      // Continue with logout even if server request fails
    } finally {
      this.clearTokens()
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  async getCurrentUser() {
    try {
      const response: AxiosResponse = await this.api.get(API_ENDPOINTS.AUTH.ME)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Generic HTTP methods
  private async request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any): Promise<T> {
    try {
      const config = {
        method,
        url,
        ...(data && { data }),
      }

      const response: AxiosResponse<T> = await this.api.request(config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Salons
  async getSalons(params?: any) {
    return this.request('GET', API_ENDPOINTS.SALONS.LIST, params)
  }

  async getSalon(id: string) {
    return this.request('GET', API_ENDPOINTS.SALONS.GET(id))
  }

  async createSalon(data: any) {
    return this.request('POST', API_ENDPOINTS.SALONS.CREATE, data)
  }

  async updateSalon(id: string, data: any) {
    return this.request('PUT', API_ENDPOINTS.SALONS.GET(id), data)
  }

  async deleteSalon(id: string) {
    return this.request('DELETE', API_ENDPOINTS.SALONS.GET(id))
  }

  async updateSalonStatus(id: string, status: string) {
    return this.request('PUT', API_ENDPOINTS.SALONS.UPDATE_STATUS(id), { status })
  }

  // Services
  async getServices(params?: any) {
    return this.request('GET', API_ENDPOINTS.SERVICES.LIST, params)
  }

  async getService(id: string) {
    return this.request('GET', API_ENDPOINTS.SERVICES.GET(id))
  }

  async createService(data: any) {
    return this.request('POST', API_ENDPOINTS.SERVICES.CREATE, data)
  }

  async updateService(id: string, data: any) {
    return this.request('PUT', API_ENDPOINTS.SERVICES.GET(id), data)
  }

  async deleteService(id: string) {
    return this.request('DELETE', API_ENDPOINTS.SERVICES.GET(id))
  }

  // Staff
  async getStaff(params?: any) {
    return this.request('GET', API_ENDPOINTS.STAFF.LIST, params)
  }

  async getStaffMember(id: string) {
    return this.request('GET', API_ENDPOINTS.STAFF.GET(id))
  }

  async createStaffMember(data: any) {
    return this.request('POST', API_ENDPOINTS.STAFF.CREATE, data)
  }

  async updateStaffMember(id: string, data: any) {
    return this.request('PUT', API_ENDPOINTS.STAFF.GET(id), data)
  }

  async deleteStaffMember(id: string) {
    return this.request('DELETE', API_ENDPOINTS.STAFF.GET(id))
  }

  // Bookings
  async getBookings(params?: any) {
    return this.request('GET', API_ENDPOINTS.BOOKINGS.LIST, params)
  }

  async getBooking(id: string) {
    return this.request('GET', API_ENDPOINTS.BOOKINGS.GET(id))
  }

  async createBooking(data: any) {
    return this.request('POST', API_ENDPOINTS.BOOKINGS.CREATE, data)
  }

  async updateBooking(id: string, data: any) {
    return this.request('PUT', API_ENDPOINTS.BOOKINGS.GET(id), data)
  }

  async deleteBooking(id: string) {
    return this.request('DELETE', API_ENDPOINTS.BOOKINGS.GET(id))
  }

  async updateBookingStatus(id: string, status: string) {
    return this.request('PUT', API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id), { status })
  }

  // Analytics
  async getAnalyticsOverview(params?: any) {
    return this.request('GET', API_ENDPOINTS.ANALYTICS.OVERVIEW, params)
  }

  async getBookingsAnalytics(params?: any) {
    return this.request('GET', API_ENDPOINTS.ANALYTICS.BOOKINGS, params)
  }

  async getRevenueAnalytics(params?: any) {
    return this.request('GET', API_ENDPOINTS.ANALYTICS.REVENUE, params)
  }

  async getSalonsAnalytics(params?: any) {
    return this.request('GET', API_ENDPOINTS.ANALYTICS.SALONS, params)
  }

  async getServicesAnalytics(params?: any) {
    return this.request('GET', API_ENDPOINTS.ANALYTICS.SERVICES, params)
  }

  async getUsersAnalytics(params?: any) {
    return this.request('GET', API_ENDPOINTS.ANALYTICS.USERS, params)
  }

  // Users
  async getUsers(params?: any) {
    return this.request('GET', API_ENDPOINTS.USERS.LIST, params)
  }

  async getUser(id: string) {
    return this.request('GET', API_ENDPOINTS.USERS.GET(id))
  }

  async updateUser(id: string, data: any) {
    return this.request('PUT', API_ENDPOINTS.USERS.UPDATE(id), data)
  }

  // Payments
  async getPayments(params?: any) {
    return this.request('GET', API_ENDPOINTS.PAYMENTS.LIST, params)
  }

  async getPayment(id: string) {
    return this.request('GET', API_ENDPOINTS.PAYMENTS.GET(id))
  }

  async refundPayment(id: string, reason?: string) {
    return this.request('POST', API_ENDPOINTS.PAYMENTS.REFUND(id), { reason })
  }

  // Notifications
  async getNotifications(params?: any) {
    return this.request('GET', API_ENDPOINTS.NOTIFICATIONS.LIST, params)
  }

  async createNotification(data: any) {
    return this.request('POST', API_ENDPOINTS.NOTIFICATIONS.CREATE, data)
  }

  async sendNotification(data: any) {
    return this.request('POST', API_ENDPOINTS.NOTIFICATIONS.SEND, data)
  }

  // Offers
  async getOffers(params?: any) {
    return this.request('GET', API_ENDPOINTS.OFFERS.LIST, params)
  }

  async getOffer(id: string) {
    return this.request('GET', API_ENDPOINTS.OFFERS.GET(id))
  }

  async createOffer(data: any) {
    return this.request('POST', API_ENDPOINTS.OFFERS.CREATE, data)
  }

  async updateOffer(id: string, data: any) {
    return this.request('PUT', API_ENDPOINTS.OFFERS.GET(id), data)
  }

  async deleteOffer(id: string) {
    return this.request('DELETE', API_ENDPOINTS.OFFERS.GET(id))
  }

  // Error handling
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'Server error occurred'
      const status = error.response.status

      switch (status) {
        case 401:
          return new Error('Authentication failed. Please log in again.')
        case 403:
          return new Error('Access denied. Insufficient permissions.')
        case 404:
          return new Error('Resource not found.')
        case 409:
          return new Error(message || 'Conflict occurred.')
        case 422:
          return new Error(message || 'Invalid data provided.')
        case 500:
          return new Error('Internal server error. Please try again later.')
        default:
          return new Error(message || `Request failed with status ${status}`)
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.')
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred.')
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  getApiUrl(): string {
    return API_BASE_URL
  }

  getEnvironment(): string {
    return ENVIRONMENT
  }
}

// Create singleton instance
export const apiService = new ApiService()
export default apiService
