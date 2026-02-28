import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'salon_detail_screen.dart';
import '../services/storage_service.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({Key? key}) : super(key: key);

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Map<String, String>> _allSalons = [];
  List<Map<String, String>> _filteredSalons = [];
  List<bool> _isFavorite = [];
  bool _isLoading = true;
  String _selectedCategory = 'All';
  String _sortBy = 'Rating';
  double _priceRange = 200;
  List<String> _selectedServices = [];

  final List<String> _categories = ['All', 'Hair', 'Spa', 'Nails', 'Massage', 'Beauty'];
  final List<String> _services = ['Haircut', 'Coloring', 'Manicure', 'Pedicure', 'Facial', 'Massage'];
  final List<String> _sortOptions = ['Rating', 'Price', 'Distance', 'Name'];

  @override
  void initState() {
    super.initState();
    _loadSalons();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    _filterSalons();
  }

  Future<void> _loadSalons() async {
    final salons = await StorageService.getSalons();
    final favoriteStatus = await Future.wait(
      salons.map((salon) => StorageService.isFavorite(salon['name']!)),
    );
    setState(() {
      _allSalons = salons;
      _filteredSalons = salons;
      _isFavorite = favoriteStatus;
      _isLoading = false;
    });
  }

  void _filterSalons() {
    setState(() {
      _filteredSalons = _allSalons.where((salon) {
        final matchesSearch = salon['name']!.toLowerCase().contains(_searchController.text.toLowerCase());
        final matchesCategory = _selectedCategory == 'All' || 
            salon['name']!.toLowerCase().contains(_selectedCategory.toLowerCase());
        final matchesPrice = true; // Simplified for demo
        return matchesSearch && matchesCategory && matchesPrice;
      }).toList();

      // Sort results
      _filteredSalons.sort((a, b) {
        switch (_sortBy) {
          case 'Rating':
            return double.parse(b['rating']!).compareTo(double.parse(a['rating']!));
          case 'Distance':
            return double.parse(a['distance']!.replaceAll(RegExp(r'[^0-9.]'), ''))
                .compareTo(double.parse(b['distance']!.replaceAll(RegExp(r'[^0-9.]'), '')));
          case 'Name':
            return a['name']!.compareTo(b['name']!);
          default:
            return 0;
        }
      });
    });
  }

  Future<void> _toggleFavorite(int index) async {
    final salon = _filteredSalons[index];
    if (_isFavorite[_allSalons.indexOf(salon)]) {
      await StorageService.removeFromFavorites(salon['name']!);
      _showNotification('Removed from favorites', salon['name']!);
    } else {
      await StorageService.addToFavorites(salon);
      _showNotification('Added to favorites', salon['name']!);
    }
    
    final isFav = await StorageService.isFavorite(salon['name']!);
    setState(() {
      _isFavorite[_allSalons.indexOf(salon)] = isFav;
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
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: SafeArea(
        child: Column(
          children: [
            _buildSearchHeader(),
            _buildFilterChips(),
            _buildResults(),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_ios, color: Color(0xFF1A1A1A)),
                onPressed: () => Navigator.pop(context),
              ),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search salons, services...',
                    hintStyle: GoogleFonts.inter(color: const Color(0xFF666666)),
                    prefixIcon: const Icon(Icons.search, color: Color(0xFF666666)),
                    filled: true,
                    fillColor: const Color(0xFFF5F5F5),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF1A1A1A),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: IconButton(
                  icon: const Icon(Icons.tune, color: Colors.white),
                  onPressed: _showFilterDialog,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          final isSelected = category == _selectedCategory;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(category, style: GoogleFonts.inter()),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  _selectedCategory = category;
                  _filterSalons();
                });
              },
              backgroundColor: Colors.white,
              selectedColor: const Color(0xFF1A1A1A),
              checkmarkColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(color: isSelected ? const Color(0xFF1A1A1A) : const Color(0xFFE0E0E0)),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildResults() {
    if (_isLoading) {
      return Expanded(
        child: Center(
          child: CircularProgressIndicator(color: const Color(0xFF1A1A1A)),
        ),
      );
    }

    if (_filteredSalons.isEmpty) {
      return Expanded(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.search_off,
                size: 80,
                color: const Color(0xFFCCCCCC),
              ),
              const SizedBox(height: 16),
              Text(
                'No salons found',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  color: const Color(0xFF666666),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Try adjusting your search or filters',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: const Color(0xFF999999),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Expanded(
      child: AnimationLimiter(
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _filteredSalons.length,
          itemBuilder: (context, index) {
            final salon = _filteredSalons[index];
            final originalIndex = _allSalons.indexOf(salon);
            return AnimationConfiguration.staggeredList(
              position: index,
              duration: const Duration(milliseconds: 500),
              child: SlideAnimation(
                verticalOffset: 50.0,
                child: FadeInAnimation(
                  child: _buildSalonCard(salon, originalIndex),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildSalonCard(Map<String, String> salon, int originalIndex) {
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
                onTap: () => _toggleFavorite(originalIndex),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: _isFavorite[originalIndex] ? const Color(0xFFFFEBEE) : const Color(0xFFF5F5F5),
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
                    _isFavorite[originalIndex] ? Icons.favorite : Icons.favorite_border,
                    color: _isFavorite[originalIndex] ? const Color(0xFFE91E63) : const Color(0xFF666666),
                    size: 22,
                  ),
                ),
              ),
              const SizedBox(height: 12),
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
        ],
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Advanced Filters', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        content: StatefulBuilder(
          builder: (context, setDialogState) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Sort by
              Text('Sort by:', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              DropdownButton<String>(
                value: _sortBy,
                isExpanded: true,
                items: _sortOptions.map((option) {
                  return DropdownMenuItem(
                    value: option,
                    child: Text(option, style: GoogleFonts.inter()),
                  );
                }).toList(),
                onChanged: (value) {
                  setDialogState(() => _sortBy = value!);
                },
              ),
              const SizedBox(height: 16),
              // Price range
              Text('Max Price: \$${_priceRange.toInt()}', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
              Slider(
                value: _priceRange,
                max: 200,
                divisions: 20,
                onChanged: (value) {
                  setDialogState(() => _priceRange = value);
                },
              ),
              const SizedBox(height: 16),
              // Services
              Text('Services:', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
              Wrap(
                spacing: 8,
                children: _services.map((service) {
                  final isSelected = _selectedServices.contains(service);
                  return FilterChip(
                    label: Text(service, style: GoogleFonts.inter(fontSize: 12)),
                    selected: isSelected,
                    onSelected: (selected) {
                      setDialogState(() {
                        if (selected) {
                          _selectedServices.add(service);
                        } else {
                          _selectedServices.remove(service);
                        }
                      });
                    },
                    backgroundColor: const Color(0xFFF5F5F5),
                    selectedColor: const Color(0xFF1A1A1A),
                    checkmarkColor: Colors.white,
                  );
                }).toList(),
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
              setState(() => _filterSalons());
              Navigator.pop(context);
            },
            child: Text('Apply', style: GoogleFonts.inter(color: const Color(0xFF1A1A1A))),
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
