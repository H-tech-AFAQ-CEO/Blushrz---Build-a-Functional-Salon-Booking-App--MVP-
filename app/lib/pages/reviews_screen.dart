import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';

class ReviewsScreen extends StatefulWidget {
  final Map<String, String> salon;

  const ReviewsScreen({Key? key, required this.salon}) : super(key: key);

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  final List<Map<String, dynamic>> _reviews = [
    {
      'name': 'Sarah Johnson',
      'rating': 5.0,
      'date': '2 days ago',
      'comment': 'Amazing experience! The staff was very professional and the service exceeded my expectations. Will definitely come back!',
      'avatar': 'https://i.pravatar.cc/150?img=1',
      'service': 'Haircut & Styling',
      'helpful': 24,
    },
    {
      'name': 'Michael Chen',
      'rating': 4.5,
      'date': '1 week ago',
      'comment': 'Great atmosphere and skilled stylists. The only reason I\'m not giving 5 stars is because the wait time was a bit longer than expected.',
      'avatar': 'https://i.pravatar.cc/150?img=2',
      'service': 'Hair Coloring',
      'helpful': 18,
    },
    {
      'name': 'Emily Davis',
      'rating': 5.0,
      'date': '2 weeks ago',
      'comment': 'Perfect! I love my new hair color. The stylist really listened to what I wanted and gave great suggestions.',
      'avatar': 'https://i.pravatar.cc/150?img=3',
      'service': 'Hair Coloring',
      'helpful': 32,
    },
    {
      'name': 'James Wilson',
      'rating': 4.0,
      'date': '3 weeks ago',
      'comment': 'Good service overall. The staff is friendly and the prices are reasonable. Would recommend to friends.',
      'avatar': 'https://i.pravatar.cc/150?img=4',
      'service': 'Beard Trim',
      'helpful': 15,
    },
    {
      'name': 'Lisa Anderson',
      'rating': 5.0,
      'date': '1 month ago',
      'comment': 'Exceptional service from start to finish. The booking process was easy and the actual service was even better!',
      'avatar': 'https://i.pravatar.cc/150?img=5',
      'service': 'Facial Treatment',
      'helpful': 28,
    },
  ];

  double _averageRating = 4.7;
  int _totalReviews = 127;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: Colors.white,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: Color(0xFF1A1A1A)),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      const Color(0xFF1A1A1A),
                      const Color(0xFF333333),
                    ],
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 80, 24, 24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Reviews & Ratings',
                        style: GoogleFonts.playfairDisplay(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        widget.salon['name']!,
                        style: GoogleFonts.inter(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: _buildRatingSummary(),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final review = _reviews[index];
                  return AnimationConfiguration.staggeredList(
                    position: index,
                    duration: const Duration(milliseconds: 500),
                    child: SlideAnimation(
                      verticalOffset: 50.0,
                      child: FadeInAnimation(
                        child: _buildReviewCard(review),
                      ),
                    ),
                  );
                },
                childCount: _reviews.length,
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showWriteReviewDialog,
        backgroundColor: const Color(0xFF1A1A1A),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.rate_review),
        label: Text('Write Review', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
      ),
    );
  }

  Widget _buildRatingSummary() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(24),
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        _averageRating.toString(),
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF1A1A1A),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: List.generate(5, (index) {
                              return Icon(
                                index < _averageRating.floor()
                                    ? Icons.star
                                    : index < _averageRating
                                        ? Icons.star_half
                                        : Icons.star_border,
                                color: const Color(0xFFFFB800),
                                size: 20,
                              );
                            }),
                          ),
                          Text(
                            '$_totalReviews reviews',
                            style: GoogleFonts.inter(
                              color: const Color(0xFF666666),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              const Spacer(),
              Column(
                children: [5, 4, 3, 2, 1].map((rating) {
                  final percentage = _getRatingPercentage(rating);
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Row(
                      children: [
                        Text(
                          '$rating',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: const Color(0xFF666666),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(Icons.star, color: const Color(0xFFFFB800), size: 12),
                        const SizedBox(width: 8),
                        Container(
                          width: 100,
                          height: 8,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE0E0E0),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: FractionallySizedBox(
                            alignment: Alignment.centerLeft,
                            widthFactor: percentage,
                            child: Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFB800),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${(percentage * 100).toInt()}%',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: const Color(0xFF666666),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  double _getRatingPercentage(int rating) {
    // Simulated rating distribution
    switch (rating) {
      case 5: return 0.65;
      case 4: return 0.20;
      case 3: return 0.10;
      case 2: return 0.03;
      case 1: return 0.02;
      default: return 0.0;
    }
  }

  Widget _buildReviewCard(Map<String, dynamic> review) {
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  image: DecorationImage(
                    image: NetworkImage(review['avatar']),
                    fit: BoxFit.cover,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          review['name'],
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF1A1A1A),
                          ),
                        ),
                        const Spacer(),
                        Row(
                          children: List.generate(5, (index) {
                            return Icon(
                              index < review['rating']
                                  ? Icons.star
                                  : Icons.star_border,
                              color: const Color(0xFFFFB800),
                              size: 16,
                            );
                          }),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      review['service'] + ' • ' + review['date'],
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: const Color(0xFF666666),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            review['comment'],
            style: GoogleFonts.inter(
              fontSize: 14,
              color: const Color(0xFF333333),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.thumb_up_outlined, size: 18),
                      onPressed: () {},
                      color: const Color(0xFF666666),
                    ),
                    Text(
                      '${review['helpful']}',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: const Color(0xFF666666),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                ),
              ),
              const Spacer(),
              TextButton(
                onPressed: () {},
                child: Text(
                  'Report',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: const Color(0xFF666666),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showWriteReviewDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Write a Review', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        content: StatefulBuilder(
          builder: (context, setDialogState) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Rating stars
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  return IconButton(
                    icon: Icon(
                      index < 4 ? Icons.star : Icons.star_border,
                      color: const Color(0xFFFFB800),
                      size: 32,
                    ),
                    onPressed: () {
                      setDialogState(() {});
                    },
                  );
                }),
              ),
              const SizedBox(height: 16),
              TextField(
                decoration: InputDecoration(
                  hintText: 'Share your experience...',
                  hintStyle: GoogleFonts.inter(color: const Color(0xFF666666)),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                maxLines: 4,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: GoogleFonts.inter()),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Review submitted successfully!', style: GoogleFonts.inter()),
                  backgroundColor: const Color(0xFF4CAF50),
                ),
              );
            },
            child: Text('Submit', style: GoogleFonts.inter(color: const Color(0xFF1A1A1A))),
          ),
        ],
      ),
    );
  }
}
