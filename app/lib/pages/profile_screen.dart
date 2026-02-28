import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/storage_service.dart';
import 'settings_screen.dart';
import 'notifications_screen.dart';
import 'favorites_screen.dart';
import 'bookings_screen.dart';
import 'rewards_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, String>? _userData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final userData = await StorageService.getUserData();
    setState(() {
      _userData = userData;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: Center(
          child: CircularProgressIndicator(color: Theme.of(context).colorScheme.primary),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Theme.of(context).shadowColor.withOpacity(0.08),
                      blurRadius: 25,
                      offset: const Offset(0, 12),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1A1A1A),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 15,
                            offset: const Offset(0, 8),
                          ),
                        ],
                        image: _userData?['avatar'] != null
                            ? DecorationImage(
                                image: NetworkImage(_userData!['avatar']!),
                                fit: BoxFit.cover,
                              )
                            : null,
                      ),
                      child: _userData?['avatar'] == null
                          ? const Icon(Icons.person, size: 50, color: Colors.white)
                          : null,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _userData?['name'] ?? 'Guest User',
                      style: GoogleFonts.playfairDisplay(fontSize: 24, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onSurface),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _userData?['email'] ?? 'No email',
                      style: GoogleFonts.inter(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Theme.of(context).shadowColor.withOpacity(0.08),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _buildProfileOption(Icons.favorite_outline, 'Favorites', () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const FavoritesScreen()),
                      );
                    }),
                    _buildProfileOption(Icons.history_outlined, 'Booking History', () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const BookingsScreen()),
                      );
                    }),
                    _buildProfileOption(Icons.notifications_outlined, 'Notifications', () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const NotificationsScreen()),
                      );
                    }),
                    _buildProfileOption(Icons.card_giftcard, 'Rewards', () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const RewardsScreen()),
                      );
                    }),
                    _buildProfileOption(Icons.payment_outlined, 'Payment Methods', () {}),
                    _buildProfileOption(Icons.help_outline, 'Help & Support', () {}),
                    _buildProfileOption(Icons.settings_outlined, 'Settings', () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const SettingsScreen()),
                      );
                    }),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Theme.of(context).shadowColor.withOpacity(0.08),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: _buildProfileOption(Icons.logout, 'Logout', () {}, isRed: true),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileOption(IconData icon, String title, VoidCallback onTap, {bool isRed = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: ListTile(
        leading: Icon(icon, size: 24, color: isRed ? const Color(0xFFF44336) : Theme.of(context).colorScheme.onSurface),
        title: Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: isRed ? const Color(0xFFF44336) : Theme.of(context).colorScheme.onSurface,
          ),
        ),
        trailing: Icon(Icons.arrow_forward_ios, size: 16, color: isRed ? const Color(0xFFF44336) : Theme.of(context).colorScheme.onSurface.withOpacity(0.7)),
        onTap: onTap,
        contentPadding: EdgeInsets.zero,
      ),
    );
  }
}
