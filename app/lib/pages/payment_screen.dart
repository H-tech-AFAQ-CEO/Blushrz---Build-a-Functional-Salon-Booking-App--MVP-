import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'confirmation_screen.dart';
import '../services/storage_service.dart';

class PaymentScreen extends StatefulWidget {
  final Map<String, String> salon;
  final Map<String, String> service;
  final DateTime date;
  final String time;

  const PaymentScreen({
    Key? key,
    required this.salon,
    required this.service,
    required this.date,
    required this.time,
  }) : super(key: key);

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedPayment = 'Apple Pay';
  bool _isProcessing = false;
  String? _errorMessage;

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
        title: Text('Payment', style: GoogleFonts.playfairDisplay(color: const Color(0xFF1A1A1A), fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Booking Summary', style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  _buildSummaryRow('Salon', widget.salon['name']!),
                  _buildSummaryRow('Service', widget.service['name']!),
                  _buildSummaryRow('Date', '${widget.date.day}/${widget.date.month}/${widget.date.year}'),
                  _buildSummaryRow('Time', widget.time),
                  _buildSummaryRow('Duration', widget.service['duration']!),
                  const Divider(height: 32),
                  _buildSummaryRow('Total', widget.service['price']!, isBold: true),
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
                  Text('Payment Method', style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  _buildPaymentOption('Apple Pay', Icons.apple),
                  const SizedBox(height: 12),
                  _buildPaymentOption('Tabby', Icons.account_balance_wallet),
                  const SizedBox(height: 12),
                  _buildPaymentOption('Tamara', Icons.credit_card),
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
            onPressed: _isProcessing ? null : () async {
              setState(() {
                _isProcessing = true;
                _errorMessage = null;
              });
              
              try {
                // Create payment intent on server
                final paymentData = {
                  'amount': _extractAmount(widget.service['price']!),
                  'currency': 'SAR',
                  'paymentMethod': _selectedPayment,
                  'description': '${widget.service['name']} at ${widget.salon['name']}',
                  'metadata': {
                    'salonId': widget.salon['id'] ?? widget.salon['name'],
                    'salonName': widget.salon['name'],
                    'serviceId': widget.service['id'] ?? 'unknown',
                    'serviceName': widget.service['name'],
                    'date': '${widget.date.day}/${widget.date.month}/${widget.date.year}',
                    'time': widget.time,
                  },
                };
                
                final paymentIntent = await StorageService.createPaymentIntent(paymentData);
                
                // Simulate payment processing (in real app, integrate with payment provider)
                await Future.delayed(const Duration(seconds: 2));
                
                // Confirm payment with server
                final confirmedPayment = await StorageService.confirmPayment(paymentIntent['id']);
                
                if (confirmedPayment['status'] == 'succeeded') {
                  // Payment successful, create booking
                  final bookingData = {
                    'salonId': widget.salon['id'],
                    'serviceId': widget.service['id'],
                    'date': '${widget.date.day}/${widget.date.month}/${widget.date.year}',
                    'time': widget.time,
                    'price': widget.service['price'],
                    'paymentId': confirmedPayment['id'],
                    'paymentMethod': _selectedPayment,
                  };
                  
                  await StorageService.saveBooking(bookingData);
                  
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(
                      builder: (context) => ConfirmationScreen(
                        salon: widget.salon,
                        service: widget.service,
                        date: widget.date,
                        time: widget.time,
                        bookingId: confirmedPayment['id']?.toString() ?? 'unknown',
                      ),
                    ),
                    (route) => false,
                  );
                } else {
                  throw Exception('Payment failed');
                }
              } catch (e) {
                setState(() {
                  _errorMessage = 'Payment failed. Please try again.';
                  _isProcessing = false;
                });
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1A1A1A),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 56),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: _isProcessing
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : Text('Pay ${widget.service['price']}', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
          ),
        ),
      ),
    );
  }

  // Helper method to extract numeric amount from price string
  double _extractAmount(String priceString) {
    // Remove currency symbols and convert to double
    final cleanedPrice = priceString.replaceAll(RegExp(r'[^\d.]'), '');
    return double.tryParse(cleanedPrice) ?? 0.0;
  }

  Widget _buildSummaryRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: isBold ? 16 : 14,
              color: const Color(0xFF666666),
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: isBold ? 18 : 14,
              fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
              color: const Color(0xFF1A1A1A),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption(String name, IconData icon) {
    final isSelected = _selectedPayment == name;
    return GestureDetector(
      onTap: () => setState(() => _selectedPayment = name),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1A1A1A).withOpacity(0.05) : Colors.white,
          border: Border.all(
            color: isSelected ? const Color(0xFF1A1A1A) : const Color(0xFFE0E0E0),
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, size: 28, color: isSelected ? const Color(0xFF1A1A1A) : const Color(0xFF666666)),
            const SizedBox(width: 16),
            Text(
              name,
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: isSelected ? const Color(0xFF1A1A1A) : const Color(0xFF666666),
              ),
            ),
            const Spacer(),
            if (isSelected)
              Container(
                padding: const EdgeInsets.all(2),
                decoration: const BoxDecoration(
                  color: Color(0xFF1A1A1A),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, size: 16, color: Colors.white),
              ),
          ],
        ),
      ),
    );
  }
}
