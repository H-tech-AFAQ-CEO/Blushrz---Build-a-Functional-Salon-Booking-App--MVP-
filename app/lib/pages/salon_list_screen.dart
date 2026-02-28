import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'salon_detail_screen.dart';
import 'search_screen.dart';
import '../services/storage_service.dart';

class SalonListScreen extends StatefulWidget {
  const SalonListScreen({Key? key}) : super(key: key);

  @override
  State<SalonListScreen> createState() => _SalonListScreenState();
}

class _SalonListScreenState extends State<SalonListScreen> {
  List<Map<String, String>> _salons = [];
  List<bool> _isFavorite = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSalons();
  }

  Future<void> _loadSalons() async {
    final salons = await StorageService.getSalons();
    final favoriteStatus = await Future.wait(
      salons.map((salon) => StorageService.isFavorite(salon['name']!)),
    );
    setState(() {
      _salons = salons;
      _isFavorite = favoriteStatus;
      _isLoading = false;
    });
  }

  Future<void> _toggleFavorite(int index) async {
    final salon = _salons[index];
    if (_isFavorite[index]) {
      await StorageService.removeFromFavorites(salon['name']!);
      _showNotification('Removed from favorites', salon['name']!);
    } else {
      await StorageService.addToFavorites(salon);
      _showNotification('Added to favorites', salon['name']!);
    }
    
    // Update the favorite status
    final isFav = await StorageService.isFavorite(salon['name']!);
    setState(() {
      _isFavorite[index] = isFav;
    });
  }

  void _showNotification(String title, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
            Text(message, style: GoogleFonts.inter(fontSize: 12)),
          ],
        ),
        backgroundColor: const Color(0xFF1A1A1A),
        duration: const Duration(seconds: 2),
      ),
    );
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
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 120,
              floating: false,
              pinned: true,
              backgroundColor: Theme.of(context).colorScheme.surface,
              elevation: 0,
              flexibleSpace: FlexibleSpaceBar(
                title: Text(
                  'Find Your Salon',
                  style: GoogleFonts.playfairDisplay(color: Theme.of(context).colorScheme.onSurface, fontWeight: FontWeight.bold, fontSize: 20),
                ),
                titlePadding: const EdgeInsets.only(left: 24, bottom: 16),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverToBoxAdapter(
                child: GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const SearchScreen()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
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
                    child: Row(
                      children: [
                        Icon(Icons.search, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7)),
                        const SizedBox(width: 12),
                        Text(
                          'Search salons, services...',
                          style: GoogleFonts.inter(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7)),
                        ),
                        const Spacer(),
                        Icon(Icons.tune, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final salon = _salons[index];
                    return _buildSalonCard(context, salon, index);
                  },
                  childCount: _salons.length,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSalonCard(BuildContext context, Map<String, String> salon, int index) {
    return AnimationConfiguration.staggeredList(
      position: index,
      duration: const Duration(milliseconds: 500),
      child: SlideAnimation(
        verticalOffset: 50.0,
        child: FadeInAnimation(
          child: GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                PageRouteBuilder(
                  pageBuilder: (context, animation, secondaryAnimation) => SalonDetailScreen(salon: salon),
                  transitionsBuilder: (context, animation, secondaryAnimation, child) {
                    const begin = Offset(1.0, 0.0);
                    const end = Offset.zero;
                    const curve = Curves.easeInOut;
                    var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
                    return SlideTransition(position: animation.drive(tween), child: child);
                  },
                ),
              );
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(20),
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
              child: Row(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Icon(
                        _getSalonIcon(salon['icon']!),
                        size: 36,
                        color: const Color(0xFF1A1A1A),
                      ),
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          salon['name']!,
                          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.star, size: 16, color: Color(0xFFFFB800)),
                            const SizedBox(width: 4),
                            Text(salon['rating']!, style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF666666))),
                            const SizedBox(width: 12),
                            const Icon(Icons.location_on, size: 16, color: Color(0xFF666666)),
                            const SizedBox(width: 4),
                            Text(salon['distance']!, style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF666666))),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _buildStatusBadge(salon['status']!),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    children: [
                      GestureDetector(
                        onTap: () => _toggleFavorite(index),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: _isFavorite[index] ? const Color(0xFFFFEBEE) : const Color(0xFFF5F5F5),
                            borderRadius: BorderRadius.circular(22),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Icon(
                            _isFavorite[index] ? Icons.favorite : Icons.favorite_border,
                            color: _isFavorite[index] ? const Color(0xFFE91E63) : const Color(0xFF666666),
                            size: 22,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Icon(Icons.arrow_forward_ios, size: 16, color: Color(0xFF666666)),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  IconData _getSalonIcon(String iconName) {
    switch (iconName) {
      case 'content_cut':
        return Icons.content_cut;
      case 'brush':
        return Icons.brush;
      case 'spa':
        return Icons.spa;
      case 'diamond':
        return Icons.diamond;
      case 'haircut':
        return Icons.content_cut;
      default:
        return Icons.store;
    }
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    if (status == 'Available') {
      color = const Color(0xFF4CAF50);
    } else if (status == 'Busy') {
      color = const Color(0xFFFF9800);
    } else {
      color = const Color(0xFFF44336);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status,
        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }
}
