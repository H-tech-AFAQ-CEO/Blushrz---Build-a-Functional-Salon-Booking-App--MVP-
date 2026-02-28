import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';

class GalleryScreen extends StatefulWidget {
  final Map<String, String> salon;

  const GalleryScreen({Key? key, required this.salon}) : super(key: key);

  @override
  State<GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends State<GalleryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedImageIndex = 0;

  final List<String> _categories = ['All', 'Haircuts', 'Coloring', 'Styling', 'Treatments'];
  
  final List<Map<String, dynamic>> _galleryImages = [
    {
      'url': 'https://picsum.photos/400/300?random=1',
      'category': 'Haircuts',
      'title': 'Modern Bob Cut',
      'likes': 245,
      'description': 'Sleek and stylish bob cut perfect for professional look',
    },
    {
      'url': 'https://picsum.photos/400/300?random=2',
      'category': 'Coloring',
      'title': 'Balayage Highlights',
      'likes': 189,
      'description': 'Natural-looking balayage with soft highlights',
    },
    {
      'url': 'https://picsum.photos/400/300?random=3',
      'category': 'Styling',
      'title': 'Wedding Updo',
      'likes': 312,
      'description': 'Elegant updo perfect for special occasions',
    },
    {
      'url': 'https://picsum.photos/400/300?random=4',
      'category': 'Treatments',
      'title': 'Keratin Treatment',
      'likes': 156,
      'description': 'Smooth and frizz-free hair with keratin treatment',
    },
    {
      'url': 'https://picsum.photos/400/300?random=5',
      'category': 'Haircuts',
      'title': 'Pixie Cut',
      'likes': 278,
      'description': 'Short and chic pixie cut for bold look',
    },
    {
      'url': 'https://picsum.photos/400/300?random=6',
      'category': 'Coloring',
      'title': 'Fashion Colors',
      'likes': 423,
      'description': 'Vibrant fashion colors for expressive style',
    },
    {
      'url': 'https://picsum.photos/400/300?random=7',
      'category': 'Styling',
      'title': 'Beach Waves',
      'likes': 367,
      'description': 'Relaxed beach waves for casual elegance',
    },
    {
      'url': 'https://picsum.photos/400/300?random=8',
      'category': 'Treatments',
      'title': 'Scalp Treatment',
      'likes': 134,
      'description': 'Revitalizing scalp treatment for healthy hair',
    },
    {
      'url': 'https://picsum.photos/400/300?random=9',
      'category': 'Haircuts',
      'title': 'Layered Cut',
      'likes': 298,
      'description': 'Versatile layered cut for various styling options',
    },
  ];

  List<Map<String, dynamic>> get _filteredImages {
    if (_tabController.index == 0) return _galleryImages;
    final selectedCategory = _categories[_tabController.index];
    return _galleryImages.where((image) => image['category'] == selectedCategory).toList();
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _categories.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

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
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    'https://picsum.photos/800/400?random=0',
                    fit: BoxFit.cover,
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.7),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 80, 24, 24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Portfolio',
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
                            color: Colors.white,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: _buildTabBar(),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.8,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final image = _filteredImages[index];
                  return AnimationConfiguration.staggeredList(
                    position: index,
                    duration: const Duration(milliseconds: 500),
                    child: SlideAnimation(
                      verticalOffset: 50.0,
                      child: FadeInAnimation(
                        child: _buildImageCard(image, index),
                      ),
                    ),
                  );
                },
                childCount: _filteredImages.length,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.all(16),
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
      child: TabBar(
        controller: _tabController,
        isScrollable: true,
        labelColor: const Color(0xFF1A1A1A),
        unselectedLabelColor: const Color(0xFF666666),
        indicator: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          borderRadius: BorderRadius.circular(12),
        ),
        labelStyle: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 12),
        unselectedLabelStyle: GoogleFonts.inter(fontSize: 12),
        tabs: _categories.map((category) {
          return Tab(text: category);
        }).toList(),
        onTap: (index) => setState(() {}),
      ),
    );
  }

  Widget _buildImageCard(Map<String, dynamic> image, int index) {
    return GestureDetector(
      onTap: () => _showImagePreview(image, index),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: Stack(
                  children: [
                    Image.network(
                      image['url'],
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.5),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.favorite_border,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 1,
                child: Container(
                  color: Colors.white,
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        image['title'],
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF1A1A1A),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.favorite, color: Color(0xFFE91E63), size: 12),
                          const SizedBox(width: 4),
                          Text(
                            '${image['likes']}',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              color: const Color(0xFF666666),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showImagePreview(Map<String, dynamic> image, int index) {
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => ImagePreviewScreen(
          image: image,
          allImages: _filteredImages,
          initialIndex: index,
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
  }
}

class ImagePreviewScreen extends StatefulWidget {
  final Map<String, dynamic> image;
  final List<Map<String, dynamic>> allImages;
  final int initialIndex;

  const ImagePreviewScreen({
    Key? key,
    required this.image,
    required this.allImages,
    required this.initialIndex,
  }) : super(key: key);

  @override
  State<ImagePreviewScreen> createState() => _ImagePreviewScreenState();
}

class _ImagePreviewScreenState extends State<ImagePreviewScreen> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          '${_currentIndex + 1} / ${widget.allImages.length}',
          style: GoogleFonts.inter(color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              itemCount: widget.allImages.length,
              onPageChanged: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              itemBuilder: (context, index) {
                final currentImage = widget.allImages[index];
                return Column(
                  children: [
                    Expanded(
                      child: InteractiveViewer(
                        child: Image.network(
                          currentImage['url'],
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                    Container(
                      color: Colors.black,
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currentImage['title'],
                            style: GoogleFonts.playfairDisplay(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            currentImage['description'],
                            style: GoogleFonts.inter(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Icon(Icons.favorite, color: Color(0xFFE91E63)),
                              const SizedBox(width: 8),
                              Text(
                                '${currentImage['likes']} likes',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontSize: 16,
                                ),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1A1A1A),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  currentImage['category'],
                                  style: GoogleFonts.inter(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
