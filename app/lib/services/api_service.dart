import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../config/app_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  static const String _tokenKey = 'auth_token';
  static const String _refreshTokenKey = 'refresh_token';

  // Get auth headers
  Future<Map<String, String>> _getHeaders({bool includeAuth = true}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      final token = await _secureStorage.read(key: _tokenKey);
      if (token != null) {
        // Check if token is expired
        if (JwtDecoder.isExpired(token)) {
          await _refreshToken();
          final newToken = await _secureStorage.read(key: _tokenKey);
          if (newToken != null) {
            headers['Authorization'] = 'Bearer $newToken';
          }
        } else {
          headers['Authorization'] = 'Bearer $token';
        }
      }
    }

    return headers;
  }

  // Refresh token
  Future<void> _refreshToken() async {
    try {
      final refreshToken = await _secureStorage.read(key: _refreshTokenKey);
      if (refreshToken == null) throw Exception('No refresh token');

      final response = await http.post(
        Uri.parse('${AppConfig.apiBaseUrl}${AppConfig.auth}/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _secureStorage.write(key: _tokenKey, value: data['token']);
        if (data['refreshToken'] != null) {
          await _secureStorage.write(key: _refreshTokenKey, value: data['refreshToken']);
        }
      } else {
        throw Exception('Token refresh failed');
      }
    } catch (e) {
      await logout();
      rethrow;
    }
  }

  // Generic HTTP request method
  Future<http.Response> _makeRequest(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? queryParams,
    bool includeAuth = true,
  }) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}$endpoint');
    final finalUri = queryParams != null ? uri.replace(queryParameters: queryParams) : uri;
    final headers = await _getHeaders(includeAuth: includeAuth);

    late http.Response response;

    try {
      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(finalUri, headers: headers).timeout(
            AppConfig.connectionTimeout,
          );
          break;
        case 'POST':
          response = await http.post(
            finalUri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          ).timeout(AppConfig.connectionTimeout);
          break;
        case 'PUT':
          response = await http.put(
            finalUri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          ).timeout(AppConfig.connectionTimeout);
          break;
        case 'DELETE':
          response = await http.delete(finalUri, headers: headers).timeout(
            AppConfig.connectionTimeout,
          );
          break;
        default:
          throw UnsupportedError('HTTP method $method is not supported');
      }
    } on SocketException {
      throw Exception('No internet connection');
    } on HttpException {
      throw Exception('Server error');
    } catch (e) {
      throw Exception('Network error: $e');
    }

    return _handleResponse(response);
  }

  // Handle response
  http.Response _handleResponse(http.Response response) {
    switch (response.statusCode) {
      case 200:
      case 201:
        return response;
      case 400:
        throw Exception('Bad request: ${response.body}');
      case 401:
        logout(); // Clear tokens on unauthorized
        throw Exception('Unauthorized: Please login again');
      case 403:
        throw Exception('Forbidden: Access denied');
      case 404:
        throw Exception('Not found');
      case 409:
        throw Exception('Conflict: ${response.body}');
      case 500:
        throw Exception('Internal server error');
      default:
        throw Exception('Error: ${response.statusCode} - ${response.body}');
    }
  }

  // Authentication methods
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _makeRequest(
      'POST',
      '${AppConfig.auth}/login',
      body: {'email': email, 'password': password},
      includeAuth: false,
    );

    final data = jsonDecode(response.body);
    await _secureStorage.write(key: _tokenKey, value: data['token']);
    if (data['refreshToken'] != null) {
      await _secureStorage.write(key: _refreshTokenKey, value: data['refreshToken']);
    }
    return data;
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    final response = await _makeRequest(
      'POST',
      '${AppConfig.auth}/register',
      body: userData,
      includeAuth: false,
    );

    final data = jsonDecode(response.body);
    await _secureStorage.write(key: _tokenKey, value: data['token']);
    if (data['refreshToken'] != null) {
      await _secureStorage.write(key: _refreshTokenKey, value: data['refreshToken']);
    }
    return data;
  }

  Future<void> logout() async {
    try {
      await _makeRequest('POST', '${AppConfig.auth}/logout');
    } catch (e) {
      // Continue with local logout even if server logout fails
    } finally {
      await _secureStorage.delete(key: _tokenKey);
      await _secureStorage.delete(key: _refreshTokenKey);
    }
  }

  Future<bool> isLoggedIn() async {
    final token = await _secureStorage.read(key: _tokenKey);
    return token != null && !JwtDecoder.isExpired(token);
  }

  // Salon methods
  Future<List<Map<String, dynamic>>> getSalons({Map<String, String>? filters}) async {
    final response = await _makeRequest('GET', AppConfig.salons, queryParams: filters);
    final data = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(data['salons'] ?? data);
  }

  Future<Map<String, dynamic>> getSalon(String salonId) async {
    final response = await _makeRequest('GET', '${AppConfig.salons}/$salonId');
    return jsonDecode(response.body);
  }

  Future<List<Map<String, dynamic>>> getSalonServices(String salonId) async {
    final response = await _makeRequest('GET', '${AppConfig.salons}/$salonId${AppConfig.services}');
    final data = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(data['services'] ?? data);
  }

  Future<List<Map<String, dynamic>>> getSalonAvailability(String salonId, String date) async {
    final response = await _makeRequest(
      'GET',
      '${AppConfig.salons}/$salonId/availability',
      queryParams: {'date': date},
    );
    final data = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(data['availability'] ?? data);
  }

  // Booking methods
  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> bookingData) async {
    final response = await _makeRequest(
      'POST',
      AppConfig.bookings,
      body: bookingData,
    );
    return jsonDecode(response.body);
  }

  Future<List<Map<String, dynamic>>> getUserBookings() async {
    final response = await _makeRequest('GET', AppConfig.bookings);
    final data = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(data['bookings'] ?? data);
  }

  Future<Map<String, dynamic>> updateBookingStatus(String bookingId, String status) async {
    final response = await _makeRequest(
      'PUT',
      '${AppConfig.bookings}/$bookingId/status',
      body: {'status': status},
    );
    return jsonDecode(response.body);
  }

  Future<void> cancelBooking(String bookingId) async {
    await _makeRequest('DELETE', '${AppConfig.bookings}/$bookingId');
  }

  // Payment methods
  Future<Map<String, dynamic>> createPaymentIntent(Map<String, dynamic> paymentData) async {
    final response = await _makeRequest(
      'POST',
      '${AppConfig.payments}/intent',
      body: paymentData,
    );
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> confirmPayment(String paymentIntentId) async {
    final response = await _makeRequest(
      'POST',
      '${AppConfig.payments}/confirm',
      body: {'paymentIntentId': paymentIntentId},
    );
    return jsonDecode(response.body);
  }

  // User methods
  Future<Map<String, dynamic>> getUserProfile() async {
    final response = await _makeRequest('GET', AppConfig.users);
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> updateUserProfile(Map<String, dynamic> userData) async {
    final response = await _makeRequest('PUT', AppConfig.users, body: userData);
    return jsonDecode(response.body);
  }

  // Favorites methods
  Future<void> addToFavorites(String salonId) async {
    await _makeRequest('POST', '${AppConfig.users}/favorites', body: {'salonId': salonId});
  }

  Future<void> removeFromFavorites(String salonId) async {
    await _makeRequest('DELETE', '${AppConfig.users}/favorites/$salonId');
  }

  Future<List<Map<String, dynamic>>> getFavorites() async {
    final response = await _makeRequest('GET', '${AppConfig.users}/favorites');
    final data = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(data['favorites'] ?? data);
  }

  // Notifications methods
  Future<List<Map<String, dynamic>>> getNotifications() async {
    final response = await _makeRequest('GET', AppConfig.notifications);
    final data = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(data['notifications'] ?? data);
  }

  Future<void> markNotificationAsRead(String notificationId) async {
    await _makeRequest('PUT', '${AppConfig.notifications}/$notificationId/read');
  }

  Future<void> markAllNotificationsAsRead() async {
    await _makeRequest('PUT', '${AppConfig.notifications}/read-all');
  }

  // FCM Token methods
  Future<void> updateFCMToken(String token) async {
    await _makeRequest('POST', '${AppConfig.users}/fcm-token', body: {'token': token});
  }
}
