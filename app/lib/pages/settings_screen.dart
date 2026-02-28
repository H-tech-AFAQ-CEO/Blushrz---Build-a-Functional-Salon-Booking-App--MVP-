import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/storage_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _locationEnabled = true;
  bool _biometricEnabled = false;
  String _selectedLanguage = 'English';
  String _selectedCurrency = 'USD';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: Theme.of(context).colorScheme.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Settings', style: GoogleFonts.playfairDisplay(color: Theme.of(context).colorScheme.onSurface, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 16),
            _buildSection('Account Settings', [
              _buildSwitchTile(
                'Push Notifications',
                'Receive booking reminders and updates',
                Icons.notifications_outlined,
                _notificationsEnabled,
                (value) => setState(() => _notificationsEnabled = value),
              ),
              _buildSwitchTile(
                'Location Services',
                'Find salons near you',
                Icons.location_on_outlined,
                _locationEnabled,
                (value) => setState(() => _locationEnabled = value),
              ),
              _buildSwitchTile(
                'Biometric Authentication',
                'Use fingerprint or face ID to login',
                Icons.fingerprint_outlined,
                _biometricEnabled,
                (value) => setState(() => _biometricEnabled = value),
              ),
            ]),
            _buildSection('Preferences', [
              _buildLanguageTile(),
              _buildCurrencyTile(),
            ]),
            _buildSection('Support', [
              _buildActionTile(
                'Help Center',
                'Get help and support',
                Icons.help_outline,
                () => _launchURL('https://support.blushrz.com'),
              ),
              _buildActionTile(
                'Terms of Service',
                'Read our terms and conditions',
                Icons.description_outlined,
                () => _launchURL('https://blushrz.com/terms'),
              ),
              _buildActionTile(
                'Privacy Policy',
                'How we protect your data',
                Icons.privacy_tip_outlined,
                () => _launchURL('https://blushrz.com/privacy'),
              ),
            ]),
            _buildSection('About', [
              _buildActionTile(
                'Rate Us',
                'Rate our app on the app store',
                Icons.star_outline,
                () => _launchURL('https://apps.apple.com/app/blushrz'),
              ),
              _buildActionTile(
                'Share App',
                'Share Blushrz with friends',
                Icons.share_outlined,
                () => Share.share('Check out Blushrz - The best salon booking app! Download now: https://blushrz.com'),
              ),
              _buildActionTile(
                'Version',
                'Blushrz v2.0.1',
                Icons.info_outline,
                () {},
              ),
            ]),
            _buildSection('Data Management', [
              _buildActionTile(
                'Clear Cache',
                'Free up storage space',
                Icons.cleaning_services_outlined,
                () => _showClearCacheDialog(),
              ),
              _buildActionTile(
                'Export Data',
                'Download your booking history',
                Icons.download_outlined,
                () => _exportData(),
              ),
              _buildActionTile(
                'Delete Account',
                'Permanently delete your account',
                Icons.delete_forever_outlined,
                () => _showDeleteAccountDialog(),
                isDestructive: true,
              ),
            ]),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
          child: Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF666666),
              letterSpacing: 0.5,
            ),
          ),
        ),
        Container(
          color: Colors.white,
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _buildSwitchTile(String title, String subtitle, IconData icon, bool value, Function(bool) onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
      child: ListTile(
        leading: Icon(icon, color: Theme.of(context).colorScheme.onSurface),
        title: Text(title, style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
        subtitle: Text(subtitle, style: GoogleFonts.inter(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7))),
        trailing: Switch(
          value: value,
          onChanged: onChanged,
          activeColor: Theme.of(context).colorScheme.secondary,
        ),
        contentPadding: EdgeInsets.zero,
      ),
    );
  }

  Widget _buildActionTile(String title, String subtitle, IconData icon, VoidCallback onTap, {bool isDestructive = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
      child: ListTile(
        leading: Icon(icon, color: isDestructive ? const Color(0xFFF44336) : Theme.of(context).colorScheme.onSurface),
        title: Text(
          title,
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w500,
            color: isDestructive ? const Color(0xFFF44336) : null,
          ),
        ),
        subtitle: Text(subtitle, style: GoogleFonts.inter(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7))),
        trailing: Icon(Icons.arrow_forward_ios, size: 16, color: isDestructive ? const Color(0xFFF44336) : Theme.of(context).colorScheme.onSurface.withOpacity(0.7)),
        onTap: onTap,
        contentPadding: EdgeInsets.zero,
      ),
    );
  }

  Widget _buildLanguageTile() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
      child: ListTile(
        leading: const Icon(Icons.language_outlined, color: Color(0xFF1A1A1A)),
        title: Text('Language', style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
        subtitle: Text(_selectedLanguage, style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF666666))),
        trailing: Icon(Icons.arrow_forward_ios, size: 16, color: const Color(0xFF666666)),
        onTap: () => _showLanguageDialog(),
        contentPadding: EdgeInsets.zero,
      ),
    );
  }

  Widget _buildCurrencyTile() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
      child: ListTile(
        leading: const Icon(Icons.attach_money_outlined, color: Color(0xFF1A1A1A)),
        title: Text('Currency', style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
        subtitle: Text(_selectedCurrency, style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF666666))),
        trailing: Icon(Icons.arrow_forward_ios, size: 16, color: const Color(0xFF666666)),
        onTap: () => _showCurrencyDialog(),
        contentPadding: EdgeInsets.zero,
      ),
    );
  }

  void _showLanguageDialog() {
    final languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Select Language', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: languages.map((language) => RadioListTile<String>(
            title: Text(language, style: GoogleFonts.inter()),
            value: language,
            groupValue: _selectedLanguage,
            onChanged: (value) {
              setState(() => _selectedLanguage = value!);
              Navigator.pop(context);
            },
          )).toList(),
        ),
      ),
    );
  }

  void _showCurrencyDialog() {
    final currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Select Currency', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: currencies.map((currency) => RadioListTile<String>(
            title: Text(currency, style: GoogleFonts.inter()),
            value: currency,
            groupValue: _selectedCurrency,
            onChanged: (value) {
              setState(() => _selectedCurrency = value!);
              Navigator.pop(context);
            },
          )).toList(),
        ),
      ),
    );
  }

  void _showClearCacheDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Clear Cache', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        content: Text('This will clear all cached data. You may need to login again.', style: GoogleFonts.inter()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: GoogleFonts.inter()),
          ),
          TextButton(
            onPressed: () {
              StorageService.clearAllData();
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Cache cleared successfully', style: GoogleFonts.inter()),
                  backgroundColor: const Color(0xFF4CAF50),
                ),
              );
            },
            child: Text('Clear', style: GoogleFonts.inter(color: const Color(0xFFF44336))),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Delete Account', style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: const Color(0xFFF44336))),
        content: Text('This action cannot be undone. All your data will be permanently deleted.', style: GoogleFonts.inter()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: GoogleFonts.inter()),
          ),
          TextButton(
            onPressed: () {
              StorageService.clearAllData();
              Navigator.pop(context);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Account deleted successfully', style: GoogleFonts.inter()),
                  backgroundColor: const Color(0xFF4CAF50),
                ),
              );
            },
            child: Text('Delete', style: GoogleFonts.inter(color: const Color(0xFFF44336), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _exportData() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Data export feature coming soon!', style: GoogleFonts.inter()),
        backgroundColor: const Color(0xFF1A1A1A),
      ),
    );
  }

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not launch URL', style: GoogleFonts.inter()),
          backgroundColor: const Color(0xFFF44336),
        ),
      );
    }
  }
}
