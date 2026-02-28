import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'payment_screen.dart';
import '../services/storage_service.dart';
import '../services/realtime_sync_service.dart';

class BookingScreen extends StatefulWidget {
  final Map<String, String> salon;
  final Map<String, String> service;

  const BookingScreen({Key? key, required this.salon, required this.service}) : super(key: key);

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  DateTime _selectedDate = DateTime.now();
  String? _selectedTime;
  List<String> _bookedTimeSlots = [];
  bool _isLoading = false;
  bool _isCheckingAvailability = false;
  String? _errorMessage;

  final List<String> _timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  ];

  @override
  void initState() {
    super.initState();
    _loadBookedTimeSlots();
  }

  Future<void> _loadBookedTimeSlots() async {
    setState(() {
      _isCheckingAvailability = true;
      _errorMessage = null;
    });
    
    try {
      final salonId = widget.salon['id'] ?? widget.salon['name'];
      final dateStr = '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
      
      final availability = await StorageService.getSalonAvailability(salonId!, dateStr);
      
      setState(() {
        _bookedTimeSlots = availability
            .where((slot) => slot['booked'] == true)
            .map((slot) => slot['time'] as String)
            .toList();
        _isCheckingAvailability = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load availability. Please try again.';
        _isCheckingAvailability = false;
      });
    }
  }

  @override
  void didUpdateWidget(BookingScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    _loadBookedTimeSlots();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Color(0xFF1A1A1A)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Book Appointment', style: GoogleFonts.playfairDisplay(color: const Color(0xFF1A1A1A), fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Icon(
                        _getSalonIcon(widget.salon['icon'] ?? 'content_cut'),
                        size: 28,
                        color: const Color(0xFF1A1A1A),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.salon['name']!, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(widget.service['name']!, style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF666666))),
                        const SizedBox(height: 4),
                        Text(
                          '${widget.service['price']} • ${widget.service['duration']}',
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Select Date', style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 80,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: 14,
                      itemBuilder: (context, index) {
                        final date = DateTime.now().add(Duration(days: index));
                        final isSelected = _selectedDate.day == date.day;
                        return GestureDetector(
                          onTap: () async {
                            setState(() => _selectedDate = date);
                            await _loadBookedTimeSlots();
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            margin: const EdgeInsets.only(right: 12),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF1A1A1A) : const Color(0xFFF5F5F5),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][date.weekday - 1],
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    color: isSelected ? Colors.white : const Color(0xFF666666),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${date.day}',
                                  style: GoogleFonts.inter(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected ? Colors.white : const Color(0xFF1A1A1A),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Select Time', style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _timeSlots.map((time) {
                      final isSelected = _selectedTime == time;
                      final isBooked = _bookedTimeSlots.contains(time);
                      return GestureDetector(
                        onTap: isBooked || _isCheckingAvailability ? null : () => setState(() => _selectedTime = time),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: isBooked
                                ? const Color(0xFFF5F5F5)
                                : isSelected
                                    ? const Color(0xFF1A1A1A)
                                    : Colors.white,
                            border: Border.all(
                              color: isBooked
                                  ? const Color(0xFFE0E0E0)
                                  : isSelected
                                      ? const Color(0xFF1A1A1A)
                                      : const Color(0xFFE0E0E0),
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: _isCheckingAvailability
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : Text(
                                  time,
                                  style: GoogleFonts.inter(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: isBooked
                                        ? const Color(0xFFCCCCCC)
                                        : isSelected
                                            ? Colors.white
                                            : const Color(0xFF1A1A1A),
                                  ),
                                ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            if (_errorMessage != null) ...[
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline, color: Colors.red.shade600, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: GoogleFonts.inter(color: Colors.red.shade600, fontSize: 14),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.refresh, size: 20),
                      onPressed: _loadBookedTimeSlots,
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 100),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: ElevatedButton(
            onPressed: _selectedTime == null || _isLoading
                ? null
                : () async {
                    setState(() => _isLoading = true);
                    
                    try {
                      // Double-check availability before proceeding
                      final salonId = widget.salon['id'] ?? widget.salon['name'];
                      final dateStr = '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
                      
                      final isBooked = await StorageService.isTimeSlotBooked(salonId!, _selectedDate, _selectedTime!);
                      
                      if (isBooked) {
                        setState(() {
                          _errorMessage = 'This time slot is no longer available. Please select another time.';
                          _isLoading = false;
                        });
                        await _loadBookedTimeSlots();
                        return;
                      }
                      
                      Navigator.of(context).push(
                        PageRouteBuilder(
                          pageBuilder: (context, animation, secondaryAnimation) => PaymentScreen(
                            salon: widget.salon,
                            service: widget.service,
                            date: _selectedDate,
                            time: _selectedTime!,
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
                    } catch (e) {
                      setState(() {
                        _errorMessage = 'Failed to proceed. Please try again.';
                        _isLoading = false;
                      });
                    } finally {
                      if (mounted) {
                        setState(() => _isLoading = false);
                      }
                    }
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1A1A1A),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 56),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
              disabledBackgroundColor: const Color(0xFFE0E0E0),
            ),
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : Text('Continue to Payment', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
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
}
