# Admin Booking Portal - API Integration

This document outlines the comprehensive transformation of the admin booking portal from local SQLite database to live API integration with real-time updates and JWT authentication.

## Overview

The admin portal has been completely refactored to use a modern API-first architecture with:
- JWT-based authentication with secure token management
- Real-time WebSocket updates for live data synchronization
- Comprehensive API service layer with error handling
- Permission-based access control
- Modern React patterns with TypeScript

## Key Changes

### 1. API Service Layer (`lib/api-service.ts`)

**New Features:**
- Complete HTTP client with Axios and automatic retry logic
- JWT token management with automatic refresh
- Comprehensive error handling with user-friendly messages
- Environment-based configuration
- Request/response interceptors for authentication
- Type-safe API methods for all endpoints

**API Endpoints:**
- Authentication: `/auth/admin/login`, `/auth/admin/logout`, `/auth/admin/refresh`
- Salons: `/admin/salons`, `/admin/salons/{id}`, `/admin/salons/{id}/status`
- Services: `/admin/services`, `/admin/services/{id}`
- Staff: `/admin/staff`, `/admin/staff/{id}`
- Bookings: `/admin/bookings`, `/admin/bookings/{id}`, `/admin/bookings/{id}/status`
- Analytics: `/admin/analytics/*`
- Users: `/admin/users`, `/admin/users/{id}`
- Payments: `/admin/payments`, `/admin/payments/{id}/refund`

### 2. Real-Time Service (`lib/realtime-service.ts`)

**Features:**
- WebSocket integration with Socket.IO
- Automatic reconnection with exponential backoff
- Room-based subscriptions for targeted updates
- Event-driven architecture with TypeScript interfaces
- Connection status monitoring
- Graceful error handling

**Real-Time Events:**
- `booking.created`, `booking.updated`, `booking.cancelled`, `booking.completed`
- `salon.status_changed`, `salon.updated`
- `payment.completed`, `payment.failed`, `payment.refunded`
- `user.registered`, `user.updated`
- `system.maintenance`, `system.announcement`

### 3. Authentication Context (`contexts/auth-context.tsx`)

**Features:**
- JWT-based authentication with secure token storage
- Automatic token refresh on expiration
- Permission-based access control
- Protected route HOCs
- User state management
- Login/logout functionality

**Security Features:**
- Secure cookie storage with HttpOnly and SameSite
- Fallback to localStorage with encryption
- Automatic logout on token expiration
- Role-based permissions

### 4. Updated Pages

#### Dashboard (`app/dashboard/page.tsx`)
- Real-time analytics from API
- Live booking updates
- Revenue trends with actual data
- Top services analytics
- Recent bookings with real-time sync

#### Bookings Management (`app/dashboard/bookings/page.tsx`)
- API-based CRUD operations
- Real-time booking updates
- Permission-based actions
- Advanced filtering and search
- Status management with instant updates

#### Salons Management (`app/dashboard/salons/page.tsx`)
- Complete salon management
- Status toggling with real-time sync
- Home service availability
- Waiting time management
- Analytics integration

#### Login Page (`app/login/page.tsx`)
- Modern authentication UI
- Error handling with toast notifications
- Loading states
- Form validation

## Dependencies Added

```json
{
  "axios": "^1.6.7",
  "js-cookie": "^3.0.5",
  "socket.io-client": "^4.7.4",
  "@types/js-cookie": "^3.0.6",
  "sonner": "^1.7.1"
}
```

## Environment Configuration

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.blushrz.com/api
NEXT_PUBLIC_WS_URL=wss://api.blushrz.com
NEXT_PUBLIC_ENV=production

# Development
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
# NEXT_PUBLIC_WS_URL=ws://localhost:3000
# NEXT_PUBLIC_ENV=development
```

## API Requirements

The backend API must implement the following endpoints:

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/admin/logout` - Admin logout  
- `POST /api/auth/admin/refresh` - Token refresh
- `GET /api/auth/admin/me` - Get current admin user

### Salons
- `GET /api/admin/salons` - List salons with filters
- `POST /api/admin/salons` - Create salon
- `GET /api/admin/salons/{id}` - Get salon details
- `PUT /api/admin/salons/{id}` - Update salon
- `DELETE /api/admin/salons/{id}` - Delete salon
- `PUT /api/admin/salons/{id}/status` - Update salon status

### Services
- `GET /api/admin/services` - List services
- `POST /api/admin/services` - Create service
- `GET /api/admin/services/{id}` - Get service details
- `PUT /api/admin/services/{id}` - Update service
- `DELETE /api/admin/services/{id}` - Delete service

### Staff
- `GET /api/admin/staff` - List staff members
- `POST /api/admin/staff` - Create staff member
- `GET /api/admin/staff/{id}` - Get staff details
- `PUT /api/admin/staff/{id}` - Update staff member
- `DELETE /api/admin/staff/{id}` - Delete staff member

### Bookings
- `GET /api/admin/bookings` - List bookings with filters
- `POST /api/admin/bookings` - Create booking
- `GET /api/admin/bookings/{id}` - Get booking details
- `PUT /api/admin/bookings/{id}` - Update booking
- `DELETE /api/admin/bookings/{id}` - Delete booking
- `PUT /api/admin/bookings/{id}/status` - Update booking status

### Analytics
- `GET /api/admin/analytics/overview` - Dashboard overview stats
- `GET /api/admin/analytics/bookings` - Bookings analytics
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `GET /api/admin/analytics/salons` - Salon performance
- `GET /api/admin/analytics/services` - Service analytics
- `GET /api/admin/analytics/users` - User analytics

### Users
- `GET /api/admin/users` - List users
- `GET /api/admin/users/{id}` - Get user details
- `PUT /api/admin/users/{id}` - Update user
- `GET /api/admin/users/{id}/favorites` - Get user favorites

### Payments
- `GET /api/admin/payments` - List payments
- `GET /api/admin/payments/{id}` - Get payment details
- `POST /api/admin/payments/{id}/refund` - Refund payment
- `GET /api/admin/payments/webhook-logs` - Webhook logs

## WebSocket Events

The backend should emit the following Socket.IO events:

### Booking Events
- `booking.created` - New booking created
- `booking.updated` - Booking updated
- `booking.cancelled` - Booking cancelled
- `booking.completed` - Booking completed

### Salon Events
- `salon.status_changed` - Salon status updated
- `salon.updated` - Salon details updated

### Payment Events
- `payment.completed` - Payment successful
- `payment.failed` - Payment failed
- `payment.refunded` - Payment refunded

### User Events
- `user.registered` - New user registered
- `user.updated` - User details updated

### System Events
- `system.maintenance` - System maintenance notification
- `system.announcement` - System announcements

## Permission System

The admin portal supports role-based permissions:

### Permission Types
- `dashboard.view` - View dashboard
- `bookings.view` - View bookings
- `bookings.create` - Create bookings
- `bookings.edit` - Edit bookings
- `bookings.delete` - Delete bookings
- `bookings.update_status` - Update booking status
- `salons.view` - View salons
- `salons.create` - Create salons
- `salons.edit` - Edit salons
- `salons.delete` - Delete salons
- `salons.update_status` - Update salon status
- `services.view` - View services
- `services.create` - Create services
- `services.edit` - Edit services
- `services.delete` - Delete services
- `staff.view` - View staff
- `staff.create` - Create staff
- `staff.edit` - Edit staff
- `staff.delete` - Delete staff
- `analytics.view` - View analytics
- `users.view` - View users
- `users.edit` - Edit users
- `payments.view` - View payments
- `payments.refund` - Refund payments

### Role Hierarchy
- `super_admin` - All permissions
- `admin` - Most permissions except user management
- `manager` - Limited to bookings and basic management
- `staff` - View-only permissions

## Security Considerations

1. **Token Security:**
   - JWT tokens stored in secure HttpOnly cookies
   - Automatic token refresh before expiration
   - Secure transmission over HTTPS

2. **API Security:**
   - Request validation and sanitization
   - Rate limiting implementation
   - CORS configuration
   - SQL injection prevention

3. **Authentication:**
   - Password hashing with bcrypt
   - Session management
   - Logout on token expiration

4. **Real-time Security:**
   - WebSocket authentication
   - Room-based access control
   - Event validation

## Performance Optimizations

1. **API Optimizations:**
   - Request caching with React Query
   - Pagination for large datasets
   - Optimistic updates
   - Request deduplication

2. **Real-time Optimizations:**
   - Event batching
   - Selective subscriptions
   - Connection pooling
   - Automatic reconnection

3. **UI Optimizations:**
   - Loading states
   - Error boundaries
   - Lazy loading
   - Virtual scrolling for large lists

## Testing

### Unit Tests
- API service methods
- Authentication context
- Real-time service
- Utility functions

### Integration Tests
- API endpoint integration
- WebSocket connections
- Authentication flow
- Permission checks

### E2E Tests
- Complete user workflows
- Real-time updates
- Error scenarios
- Performance tests

## Migration Notes

1. **Data Migration:**
   - Existing SQLite data needs to be migrated to the backend database
   - User accounts need to be created with proper roles
   - Historical data should be preserved

2. **Feature Parity:**
   - All existing features are preserved
   - Enhanced with real-time updates
   - Improved error handling
   - Better user experience

3. **Breaking Changes:**
   - Direct database access removed
   - Authentication flow updated
   - API responses may have different structure
   - Real-time features added

## Troubleshooting

### Common Issues
1. **Authentication Errors:**
   - Check API URL configuration
   - Verify JWT secret matches backend
   - Check cookie settings

2. **Real-time Issues:**
   - Verify WebSocket URL
   - Check firewall settings
   - Monitor connection status

3. **API Errors:**
   - Check network connectivity
   - Verify API endpoints
   - Monitor server logs

### Debug Mode
Enable debug logging by setting environment to development:
```env
NEXT_PUBLIC_ENV=development
```

This will enable detailed console logging for API calls and real-time events.

## Future Enhancements

1. **Advanced Analytics:**
   - Custom date range selection
   - Export functionality
   - Advanced filtering
   - Predictive analytics

2. **Enhanced Real-time:**
   - Live chat support
   - Real-time notifications
   - Collaborative features
   - Multi-admin support

3. **Mobile App:**
   - React Native admin app
   - Push notifications
   - Offline support
   - Biometric authentication

4. **AI Integration:**
   - Smart scheduling
   - Demand prediction
   - Customer insights
   - Automated reporting
