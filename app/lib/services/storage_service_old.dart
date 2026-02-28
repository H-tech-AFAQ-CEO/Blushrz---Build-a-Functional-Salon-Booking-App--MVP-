import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _userKey = 'user_data';
  static const String _bookingsKey = 'bookings_data';
  static const String _salonsKey = 'salons_data';
  static const String _favoritesKey = 'favorites_data';
  static const String _notificationsKey = 'notifications_data';

  static Future<void> saveUserData(Map<String, String> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(userData));
  }

  static Future<Map<String, String>?> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString(_userKey);
    if (userData != null) {
      return Map<String, String>.from(jsonDecode(userData));
    }
    
    // Return sample user data for demonstration
    final sampleUser = {
      'name': 'Sarah Johnson',
      'email': 'sarah.johnson@email.com',
      'phone': '+1 (555) 123-4567',
      'avatar': 'https://i.pravatar.cc/150?img=26'
    };
    await saveUserData(sampleUser);
    return sampleUser;
  }

  static Future<void> saveBooking(Map<String, dynamic> booking) async {
    final prefs = await SharedPreferences.getInstance();
    final bookingsJson = prefs.getString(_bookingsKey) ?? '[]';
    final List<dynamic> bookings = jsonDecode(bookingsJson);
    bookings.add(booking);
    await prefs.setString(_bookingsKey, jsonEncode(bookings));
  }

  static Future<List<Map<String, dynamic>>> getBookings() async {
    final prefs = await SharedPreferences.getInstance();
    final bookingsJson = prefs.getString(_bookingsKey) ?? '[]';
    final List<dynamic> bookings = jsonDecode(bookingsJson);
    
    // Add sample bookings if empty
    if (bookings.isEmpty) {
      final sampleBookings = [
        {
          'salonName': 'Luxe Beauty Studio',
          'salonId': '1',
          'date': '15/2/2026',
          'time': '10:00 AM',
          'service': 'Haircut & Styling',
          'price': '\$45',
          'status': 'confirmed',
          'address': '123 Main St, Downtown'
        },
        {
          'salonName': 'Glamour Spa',
          'salonId': '3',
          'date': '18/2/2026',
          'time': '2:00 PM',
          'service': 'Full Body Massage',
          'price': '\$120',
          'status': 'confirmed',
          'address': '789 Wellness Blvd'
        },
        {
          'salonName': 'The Beauty Haven',
          'salonId': '9',
          'date': '20/2/2026',
          'time': '11:30 AM',
          'service': 'Facial & Makeup',
          'price': '\$80',
          'status': 'pending',
          'address': '369 Haven Street'
        },
        {
          'salonName': 'Elite Hair Lounge',
          'salonId': '2',
          'date': '10/2/2026',
          'time': '3:00 PM',
          'service': 'Hair Coloring',
          'price': '\$95',
          'status': 'completed',
          'address': '456 Fashion Ave'
        },
        {
          'salonName': 'Serenity Wellness',
          'salonId': '6',
          'date': '8/2/2026',
          'time': '9:00 AM',
          'service': 'Deep Tissue Massage',
          'price': '\$110',
          'status': 'completed',
          'address': '987 Peace Road'
        },
        {
          'salonName': 'Elegance Nail Studio',
          'salonId': '8',
          'date': '22/2/2026',
          'time': '1:00 PM',
          'service': 'Manicure & Pedicure',
          'price': '\$55',
          'status': 'confirmed',
          'address': '258 Beauty Blvd'
        },
      ];
      
      for (var booking in sampleBookings) {
        await saveBooking(booking);
      }
      return sampleBookings;
    }
    
    return bookings.cast<Map<String, dynamic>>();
  }

  static Future<void> saveSalons(List<Map<String, String>> salons) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_salonsKey, jsonEncode(salons));
  }

  static Future<List<Map<String, String>>> getSalons() async {
    final prefs = await SharedPreferences.getInstance();
    final salonsJson = prefs.getString(_salonsKey);
    if (salonsJson != null) {
      final List<dynamic> salons = jsonDecode(salonsJson);
      return salons.map((salon) => Map<String, String>.from(salon)).toList();
    }
    
    final defaultSalons = [
      {'name': 'Luxe Beauty Studio', 'rating': '4.8', 'distance': '1.2 km', 'status': 'Available', 'icon': 'content_cut', 'address': '123 Main St, Downtown', 'phone': '+1 234-567-8900', 'hours': '9:00 AM - 8:00 PM'},
      {'name': 'Elite Hair Lounge', 'rating': '4.9', 'distance': '2.5 km', 'status': 'Busy', 'icon': 'brush', 'address': '456 Fashion Ave', 'phone': '+1 234-567-8901', 'hours': '10:00 AM - 9:00 PM'},
      {'name': 'Glamour Spa', 'rating': '4.7', 'distance': '0.8 km', 'status': 'Available', 'icon': 'spa', 'address': '789 Wellness Blvd', 'phone': '+1 234-567-8902', 'hours': '8:00 AM - 10:00 PM'},
      {'name': 'Royal Beauty', 'rating': '4.6', 'distance': '3.1 km', 'status': 'Closed', 'icon': 'diamond', 'address': '321 Luxury Lane', 'phone': '+1 234-567-8903', 'hours': '9:00 AM - 7:00 PM'},
      {'name': 'Modern Cuts', 'rating': '4.8', 'distance': '1.5 km', 'status': 'Available', 'icon': 'content_cut', 'address': '654 Style Street', 'phone': '+1 234-567-8904', 'hours': '8:00 AM - 8:00 PM'},
      {'name': 'Serenity Wellness', 'rating': '4.9', 'distance': '0.5 km', 'status': 'Available', 'icon': 'spa', 'address': '987 Peace Road', 'phone': '+1 234-567-8905', 'hours': '7:00 AM - 9:00 PM'},
      {'name': 'Urban Style Barbershop', 'rating': '4.7', 'distance': '2.0 km', 'status': 'Busy', 'icon': 'content_cut', 'address': '147 Trendy Ave', 'phone': '+1 234-567-8906', 'hours': '9:00 AM - 7:00 PM'},
      {'name': 'Elegance Nail Studio', 'rating': '4.8', 'distance': '1.8 km', 'status': 'Available', 'icon': 'brush', 'address': '258 Beauty Blvd', 'phone': '+1 234-567-8907', 'hours': '10:00 AM - 8:00 PM'},
      {'name': 'The Beauty Haven', 'rating': '5.0', 'distance': '3.5 km', 'status': 'Available', 'icon': 'spa', 'address': '369 Haven Street', 'phone': '+1 234-567-8908', 'hours': '8:00 AM - 9:00 PM'},
      {'name': 'Precision Cuts', 'rating': '4.6', 'distance': '1.0 km', 'status': 'Available', 'icon': 'content_cut', 'address': '741 Precision Way', 'phone': '+1 234-567-8909', 'hours': '9:00 AM - 8:00 PM'},
      {'name': 'Radiant Glow Spa', 'rating': '4.9', 'distance': '2.8 km', 'status': 'Busy', 'icon': 'spa', 'address': '852 Glow Avenue', 'phone': '+1 234-567-8910', 'hours': '7:00 AM - 10:00 PM'},
      {'name': 'Chic Hair Studio', 'rating': '4.7', 'distance': '0.3 km', 'status': 'Available', 'icon': 'brush', 'address': '963 Chic Lane', 'phone': '+1 234-567-8911', 'hours': '8:00 AM - 7:00 PM'},
    ];
    await saveSalons(defaultSalons);
    return defaultSalons;
  }

  static Future<bool> isTimeSlotBooked(String salonId, DateTime date, String time) async {
    final bookings = await getBookings();
    return bookings.any((booking) =>
        booking['salonId'] == salonId &&
        booking['date'] == '${date.day}/${date.month}/${date.year}' &&
        booking['time'] == time);
  }

  static Future<void> clearAllData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // Favorites Management
  static Future<void> addToFavorites(Map<String, String> salon) async {
    final prefs = await SharedPreferences.getInstance();
    final favoritesJson = prefs.getString(_favoritesKey) ?? '[]';
    final List<dynamic> favorites = jsonDecode(favoritesJson);
    
    // Check if already in favorites
    if (!favorites.any((fav) => fav['name'] == salon['name'])) {
      favorites.add(salon);
      await prefs.setString(_favoritesKey, jsonEncode(favorites));
    }
  }

  static Future<void> removeFromFavorites(String salonName) async {
    final prefs = await SharedPreferences.getInstance();
    final favoritesJson = prefs.getString(_favoritesKey) ?? '[]';
    final List<dynamic> favorites = jsonDecode(favoritesJson);
    
    favorites.removeWhere((fav) => fav['name'] == salonName);
    await prefs.setString(_favoritesKey, jsonEncode(favorites));
  }

  static Future<List<Map<String, String>>> getFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    final favoritesJson = prefs.getString(_favoritesKey) ?? '[]';
    final List<dynamic> favorites = jsonDecode(favoritesJson);
    return favorites.map((fav) => Map<String, String>.from(fav)).toList();
  }

  static Future<bool> isFavorite(String salonName) async {
    final favorites = await getFavorites();
    return favorites.any((fav) => fav['name'] == salonName);
  }

  // Notifications Management
  static Future<void> addNotification(Map<String, dynamic> notification) async {
    final prefs = await SharedPreferences.getInstance();
    final notificationsJson = prefs.getString(_notificationsKey) ?? '[]';
    final List<dynamic> notifications = jsonDecode(notificationsJson);
    
    notifications.insert(0, notification); // Add to beginning
    await prefs.setString(_notificationsKey, jsonEncode(notifications));
  }

  static Future<List<Map<String, dynamic>>> getNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    final notificationsJson = prefs.getString(_notificationsKey) ?? '[]';
    final List<dynamic> notifications = jsonDecode(notificationsJson);
    return notifications.cast<Map<String, dynamic>>();
  }

  static Future<void> markNotificationAsRead(int index) async {
    final prefs = await SharedPreferences.getInstance();
    final notificationsJson = prefs.getString(_notificationsKey) ?? '[]';
    final List<dynamic> notifications = jsonDecode(notificationsJson);
    
    if (index < notifications.length) {
      notifications[index]['read'] = true;
      await prefs.setString(_notificationsKey, jsonEncode(notifications));
    }
  }

  static Future<void> markAllNotificationsAsRead() async {
    final prefs = await SharedPreferences.getInstance();
    final notificationsJson = prefs.getString(_notificationsKey) ?? '[]';
    final List<dynamic> notifications = jsonDecode(notificationsJson);
    
    for (var notification in notifications) {
      notification['read'] = true;
    }
    await prefs.setString(_notificationsKey, jsonEncode(notifications));
  }

  // Enhanced Booking Management
  static Future<void> updateBookingStatus(String bookingId, String status) async {
    final prefs = await SharedPreferences.getInstance();
    final bookingsJson = prefs.getString(_bookingsKey) ?? '[]';
    final List<dynamic> bookings = jsonDecode(bookingsJson);
    
    for (var booking in bookings) {
      if (booking['id'] == bookingId) {
        booking['status'] = status;
        break;
      }
    }
    await prefs.setString(_bookingsKey, jsonEncode(bookings));
  }

  static Future<String> getNextBookingId() async {
    final bookings = await getBookings();
    return (bookings.length + 1).toString();
  }
}
