import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'booking_screen.dart';
import 'reviews_screen.dart';
import 'gallery_screen.dart';

class SalonDetailScreen extends StatelessWidget {
  final Map<String, String> salon;

  const SalonDetailScreen({Key? key, required this.salon}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final services = [
      {'name': 'Haircut', 'price': '\$25', 'duration': '30 min'},
      {'name': 'Hair Coloring', 'price': '\$80', 'duration': '90 min'},
      {'name': 'Manicure', 'price': '\$20', 'duration': '45 min'},
      {'name': 'Pedicure', 'price': '\$30', 'duration': '60 min'},
      {'name': 'Facial Treatment', 'price': '\$60', 'duration': '60 min'},
      {'name': 'Massage', 'price': '\$70', 'duration': '75 min'},
    ];

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            backgroundColor: const Color(0xFF1A1A1A),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                color: const Color(0xFF1A1A1A),
                child: Center(
                  child: Icon(
                    _getSalonIcon(salon['icon'] ?? 'content_cut'),
                    size: 80,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          salon['name']!,
                          style: GoogleFonts.playfairDisplay(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                      ),
                      _buildStatusBadge(salon['status']!),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.star, size: 20, color: Color(0xFFFFB800)),
                      const SizedBox(width: 4),
                      Text(salon['rating']!, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                      const SizedBox(width: 4),
                      Text('(245 reviews)', style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF666666))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 20, color: Color(0xFF666666)),
                      const SizedBox(width: 8),
                      Text(salon['distance']! + ' away', style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF666666))),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Icon(Icons.access_time, size: 20, color: Color(0xFF666666)),
                      SizedBox(width: 8),
                      Text(salon['hours'] ?? '9:00 AM - 8:00 PM', style: GoogleFonts.inter(fontSize: 14, color: Color(0xFF666666))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.phone, size: 20, color: Color(0xFF666666)),
                      SizedBox(width: 8),
                      Text(salon['phone'] ?? '+1 234-567-8900', style: GoogleFonts.inter(fontSize: 14, color: Color(0xFF666666))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.location_on, size: 20, color: Color(0xFF666666)),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(salon['address'] ?? '123 Main St, Downtown', style: GoogleFonts.inter(fontSize: 14, color: Color(0xFF666666))),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Services',
                    style: GoogleFonts.playfairDisplay(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final service = services[index];
                  return _buildServiceCard(context, service);
                },
                childCount: services.length,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: _buildActionButtons(context),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
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
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  context,
                  'View Gallery',
                  Icons.photo_library,
                  const Color(0xFF9C27B0),
                  () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => GalleryScreen(salon: salon)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionButton(
                  context,
                  'Read Reviews',
                  Icons.star,
                  const Color(0xFFFFB800),
                  () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => ReviewsScreen(salon: salon)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
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

  Widget _buildServiceCard(BuildContext context, Map<String, String> service) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) => BookingScreen(
              salon: salon,
              service: service,
            ),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              const begin = Offset(0.0, 1.0);
              const end = Offset.zero;
              const curve = Curves.easeInOut;
              var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
              return SlideTransition(position: animation.drive(tween), child: child);
            },
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE0E0E0)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    service['name']!,
                    style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.access_time, size: 14, color: Color(0xFF666666)),
                      const SizedBox(width: 4),
                      Text(service['duration']!, style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF666666))),
                    ],
                  ),
                ],
              ),
            ),
            Text(
              service['price']!,
              style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: const Color(0xFF1A1A1A)),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.arrow_forward, size: 16, color: Colors.white),
            ),
          ],
        ),
      ),
    );
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status,
        style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }
}
