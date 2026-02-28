import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'salon_detail_screen.dart';
import '../services/storage_service.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({Key? key}) : super(key: key);

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  List<Map<String, String>> _favoriteSalons = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFavoriteSalons();
  }

  Future<void> _loadFavoriteSalons() async {
    final favorites = await StorageService.getFavorites();
    setState(() {
      _favoriteSalons = favorites;
      _isLoading = false;
    });
  }

  Future<void> _removeFromFavorites(Map<String, String> salon) async {
    await StorageService.removeFromFavorites(salon['name']!);
    await _loadFavoriteSalons(); // Refresh the list
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Removed from favorites', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
            Text(salon['name']!, style: GoogleFonts.inter(fontSize: 12)),
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
        title: Text('Favorites', style: GoogleFonts.playfairDisplay(color: const Color(0xFF1A1A1A), fontWeight: FontWeight.bold)),
      ),
      body: _favoriteSalons.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.favorite_border,
                    size: 80,
                    color: const Color(0xFFCCCCCC),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No favorites yet',
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      color: const Color(0xFF666666),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Tap the heart icon on salons to add them to favorites',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: const Color(0xFF999999),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(16),
              child: ListView.builder(
                itemCount: _favoriteSalons.length,
                itemBuilder: (context, index) {
                  final salon = _favoriteSalons[index];
                  return AnimationConfiguration.staggeredList(
                    position: index,
                    duration: const Duration(milliseconds: 500),
                    child: SlideAnimation(
                      verticalOffset: 50.0,
                      child: FadeInAnimation(
                        child: _buildFavoriteSalonCard(context, salon),
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }

  Widget _buildFavoriteSalonCard(BuildContext context, Map<String, String> salon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
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
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        salon['name']!,
                        style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _removeFromFavorites(salon),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFEBEE),
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
                          Icons.favorite,
                          color: const Color(0xFFE91E63),
                          size: 22,
                        ),
                      ),
                    ),
                  ],
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
          IconButton(
            icon: const Icon(Icons.arrow_forward_ios, size: 16, color: Color(0xFF666666)),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => SalonDetailScreen(salon: salon),
                ),
              );
            },
          ),
        ],
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
