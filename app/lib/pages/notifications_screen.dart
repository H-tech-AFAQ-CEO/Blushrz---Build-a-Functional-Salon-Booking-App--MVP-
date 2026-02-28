import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import '../services/storage_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;

  // Define constant IconData for notifications
  static const IconData _checkCircleIcon = Icons.check_circle;
  static const IconData _notificationsIcon = Icons.notifications;
  static const IconData _localOfferIcon = Icons.local_offer;
  static const IconData _storeIcon = Icons.store;
  static const IconData _paymentIcon = Icons.payment;
  static const Color _greenColor = Color(0xFF4CAF50);
  static const Color _blueColor = Color(0xFF2196F3);
  static const Color _orangeColor = Color(0xFFFF9800);
  static const Color _purpleColor = Color(0xFF9C27B0);

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    final notifications = await StorageService.getNotifications();
    
    // Add sample notifications if empty
    if (notifications.isEmpty) {
      final sampleNotifications = [
        {
          'title': 'Booking Confirmed',
          'message': 'Your appointment at Luxe Beauty Studio has been confirmed',
          'time': '2 hours ago',
          'iconCodePoint': _checkCircleIcon.codePoint,
          'colorValue': _greenColor.value,
          'read': false,
        },
        {
          'title': 'Reminder',
          'message': 'Your appointment at Glamour Spa is tomorrow at 2:00 PM',
          'time': '5 hours ago',
          'iconCodePoint': _notificationsIcon.codePoint,
          'colorValue': _blueColor.value,
          'read': false,
        },
        {
          'title': 'Special Offer',
          'message': 'Get 20% off on all hair treatments this weekend',
          'time': '1 day ago',
          'iconCodePoint': _localOfferIcon.codePoint,
          'colorValue': _orangeColor.value,
          'read': true,
        },
        {
          'title': 'New Salon Available',
          'message': 'Serenity Wellness is now available for bookings',
          'time': '2 days ago',
          'iconCodePoint': _storeIcon.codePoint,
          'colorValue': _purpleColor.value,
          'read': true,
        },
        {
          'title': 'Payment Successful',
          'message': 'Your payment of \$45 for haircut has been processed',
          'time': '3 days ago',
          'iconCodePoint': _paymentIcon.codePoint,
          'colorValue': _greenColor.value,
          'read': true,
        },
      ];
      
      for (var notification in sampleNotifications) {
        await StorageService.addNotification(notification);
      }
      setState(() {
        _notifications = sampleNotifications.map((n) => {
          'title': n['title'],
          'message': n['message'],
          'time': n['time'],
          'icon': _getIconFromCodePoint(n['iconCodePoint'] as int),
          'color': _getColorFromValue(n['colorValue'] as int),
          'read': n['read'],
        }).toList();
        _isLoading = false;
      });
    } else {
      setState(() {
        _notifications = notifications.map((n) => {
          'title': n['title'],
          'message': n['message'],
          'time': n['time'],
          'icon': _getIconFromCodePoint(n.containsKey('iconCodePoint') ? n['iconCodePoint'] as int : _notificationsIcon.codePoint),
          'color': _getColorFromValue(n.containsKey('colorValue') ? n['colorValue'] as int : _blueColor.value),
          'read': n['read'] ?? false,
        }).toList();
        _isLoading = false;
      });
    }
  }

  IconData _getIconFromCodePoint(int codePoint) {
    switch (codePoint) {
      case 0xe876: return _checkCircleIcon;
      case 0xe85f: return _notificationsIcon;
      case 0xe25f: return _localOfferIcon;
      case 0xe8d1: return _storeIcon;
      case 0xe8a1: return _paymentIcon;
      default: return _notificationsIcon;
    }
  }

  Color _getColorFromValue(int value) {
    switch (value) {
      case 0xFF4CAF50: return _greenColor;
      case 0xFF2196F3: return _blueColor;
      case 0xFFFF9800: return _orangeColor;
      case 0xFF9C27B0: return _purpleColor;
      default: return _blueColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFFFAFAFA),
        body: Center(
          child: CircularProgressIndicator(color: const Color(0xFF1A1A1A)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Color(0xFF1A1A1A)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Notifications', style: GoogleFonts.playfairDisplay(color: const Color(0xFF1A1A1A), fontWeight: FontWeight.bold)),
        actions: [
          TextButton(
            onPressed: () => _markAllAsRead(),
            child: Text('Mark all read', style: GoogleFonts.inter(color: const Color(0xFF1A1A1A), fontSize: 14)),
          ),
        ],
      ),
      body: AnimationLimiter(
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _notifications.length,
          itemBuilder: (context, index) {
            final notification = _notifications[index];
            return AnimationConfiguration.staggeredList(
              position: index,
              duration: const Duration(milliseconds: 400),
              child: SlideAnimation(
                verticalOffset: 30.0,
                child: FadeInAnimation(
                  child: _buildNotificationCard(notification, index),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> notification, int index) {
    return GestureDetector(
      onTap: () async {
        if (!notification['read']) {
          await StorageService.markNotificationAsRead(index);
          setState(() {
            _notifications[index]['read'] = true;
          });
        }
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: notification['read'] ? Colors.white : const Color(0xFFF5F5F5),
          borderRadius: BorderRadius.circular(20),
          border: notification['read'] 
              ? Border.all(color: const Color(0xFFE0E0E0), width: 1)
              : Border.all(color: const Color(0xFF1A1A1A), width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: notification['color'].withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: notification['color'].withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(
                notification['icon'] is IconData 
                    ? notification['icon'] as IconData
                    : Icons.notifications,
                color: notification['color'] is Color 
                    ? notification['color'] as Color
                    : const Color(0xFF2196F3),
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification['title'],
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF1A1A1A),
                          ),
                        ),
                      ),
                      if (!notification['read'])
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: const Color(0xFF1A1A1A),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.3),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    notification['message'],
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: const Color(0xFF666666),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    notification['time'],
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: const Color(0xFF999999),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _markAllAsRead() async {
    await StorageService.markAllNotificationsAsRead();
    setState(() {
      for (var notification in _notifications) {
        notification['read'] = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('All notifications marked as read', style: GoogleFonts.inter()),
        backgroundColor: const Color(0xFF4CAF50),
      ),
    );
  }
}
