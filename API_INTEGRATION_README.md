# Salon Booking App - API Integration

This document outlines the changes made to replace local storage with live API integration for the Salon Booking App.

## Overview

The app has been transformed from using SharedPreferences-based local storage to a fully integrated API-driven architecture with real-time synchronization, JWT authentication, and server-side payment verification.

## Key Changes

### 1. API Service Layer (`lib/services/api_service.dart`)

**New Features:**
- Complete HTTP client with JWT token management
- Automatic token refresh and expiration handling
- Comprehensive error handling with user-friendly messages
- Support for all CRUD operations
- Secure token storage using FlutterSecureStorage

**API Endpoints:**
- Authentication: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`
- Salons: `/salons`, `/salons/{id}`, `/salons/{id}/services`, `/salons/{id}/availability`
- Bookings: `/bookings`, `/bookings/{id}`, `/bookings/{id}/status`
- Payments: `/payments/intent`, `/payments/confirm`
- Users: `/users`, `/users/favorites`
- Notifications: `/notifications`

### 2. Real-Time Data Sync (`lib/services/realtime_sync_service.dart`)

**Features:**
- Automatic salon status synchronization every 30 seconds
- Individual salon tracking with 15-second updates
- Connectivity-aware syncing
- Real-time availability checking
- Waiting time and home service status updates

**Usage:**
```dart
final syncService = RealTimeSyncService();
syncService.startSync();
```

### 3. Enhanced Storage Service (`lib/services/storage_service.dart`)

**Replaced Features:**
- All SharedPreferences operations now use API calls
- Sample data removed - all data comes from server
- Proper error handling for network failures
- Fallback to empty data when offline

**Methods:**
- `getUserData()` - Fetches from `/users` endpoint
- `saveBooking()` - Creates booking via `/bookings`
- `getBookings()` - Fetches user bookings
- `isTimeSlotBooked()` - Checks real-time availability
- `getSalons()` - Fetches from `/salons` with filters
- `getFavorites()` - Manages favorites via API

### 4. JWT-Based Authentication

**New Authentication Flow:**
1. User registers/logs in via API
2. Server returns JWT access token and refresh token
3. Tokens stored securely using FlutterSecureStorage
4. Automatic token refresh on expiration
5. Proper logout clears all tokens

**Security Features:**
- Secure token storage (not SharedPreferences)
- Automatic token refresh
- Token expiration handling
- Server-side session management

### 5. Server-Side Payment Verification

**New Payment Flow:**
1. Client creates payment intent via `/payments/intent`
2. Server generates payment intent with payment provider
3. Client processes payment (Stripe, Apple Pay, etc.)
4. Server verifies payment via webhook confirmation
5. Booking created only after successful verification
6. Payment status tracked server-side

**Benefits:**
- Prevents fraudulent bookings
- Secure payment processing
- Server-side payment verification
- Proper error handling

### 6. Environment Configuration (`lib/config/app_config.dart`)

**Features:**
- Environment-specific API URLs
- Development, staging, and production support
- Configurable timeouts and endpoints
- Easy environment switching

**Usage:**
```bash
# Development
flutter run --dart-define=ENVIRONMENT=development --dart-define=API_BASE_URL=http://localhost:3000

# Production
flutter run --dart-define=ENVIRONMENT=production --dart-define=API_BASE_URL=https://api.blushrz.com
```

### 7. Push Notifications (`lib/services/notification_service.dart`)

**Features:**
- Firebase Cloud Messaging integration
- Local notification support
- Background message handling
- Topic subscription management
- Custom notification handling

**Notification Types:**
- Booking confirmations
- Payment status updates
- Salon status changes
- Promotional offers
- Appointment reminders

## Updated Screens

### Booking Screen
- Real-time availability checking
- Loading states during API calls
- Error handling with retry options
- Double-booking prevention

### Payment Screen
- Server-side payment intent creation
- Payment verification workflow
- Loading states during processing
- Error handling and retry

### Authentication Screen
- Email/password authentication
- JWT token management
- Form validation
- Error handling

### Splash Screen
- Authentication status checking
- Automatic navigation based on login state

## Dependencies Added

```yaml
dependencies:
  http: ^1.2.0                    # HTTP requests
  flutter_secure_storage: ^9.0.0  # Secure token storage
  jwt_decoder: ^2.0.1             # JWT token handling
  connectivity_plus: ^5.0.2      # Network connectivity
  firebase_messaging: ^14.7.19    # Push notifications
  firebase_core: ^2.24.2          # Firebase core
  flutter_local_notifications: ^16.3.2  # Local notifications
```

## API Requirements

The backend API must implement the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Salons
- `GET /api/salons` - List salons (with optional filters)
- `GET /api/salons/{id}` - Get salon details
- `GET /api/salons/{id}/services` - Get salon services
- `GET /api/salons/{id}/availability?date=YYYY-MM-DD` - Get availability

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `PUT /api/bookings/{id}/status` - Update booking status
- `DELETE /api/bookings/{id}` - Cancel booking

### Payments
- `POST /api/payments/intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment

### Users
- `GET /api/users` - Get user profile
- `PUT /api/users` - Update user profile
- `POST /api/users/favorites` - Add favorite
- `DELETE /api/users/favorites/{id}` - Remove favorite

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## Security Considerations

1. **Token Security:** All tokens stored using FlutterSecureStorage
2. **HTTPS:** All API calls should use HTTPS in production
3. **Input Validation:** Client-side validation with server-side verification
4. **Error Handling:** No sensitive information exposed in error messages
5. **Payment Security:** Server-side payment verification

## Testing

### Environment Setup
1. Set up development server with API endpoints
2. Configure environment variables
3. Test authentication flow
4. Verify real-time synchronization
5. Test payment flow with sandbox mode

### Test Cases
- User registration and login
- Token refresh on expiration
- Real-time salon status updates
- Booking creation and availability checking
- Payment processing and verification
- Push notification delivery

## Migration Notes

1. **Data Migration:** Existing local data will be replaced with server data
2. **Authentication:** Users will need to re-authenticate
3. **Offline Support:** App gracefully handles network failures
4. **Backward Compatibility:** Old SharedPreferences data ignored

## Future Enhancements

1. **Offline Mode:** Implement local caching for offline access
2. **WebSocket Integration:** Real-time updates without polling
3. **Biometric Auth:** Add fingerprint/face authentication
4. **Analytics:** Track user behavior and app performance
5. **A/B Testing:** Feature flags for gradual rollout

## Troubleshooting

### Common Issues
1. **Token Expiration:** Automatic refresh should handle this
2. **Network Errors:** Check connectivity and API status
3. **Payment Failures:** Verify payment provider configuration
4. **Notification Issues:** Check Firebase project settings

### Debug Mode
Enable debug logging by setting environment to development:
```bash
flutter run --dart-define=ENVIRONMENT=development
```

This will enable detailed logging for API calls and notifications.
