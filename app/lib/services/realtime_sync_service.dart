import 'dart:async';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'api_service.dart';

class RealTimeSyncService {
  static final RealTimeSyncService _instance = RealTimeSyncService._internal();
  factory RealTimeSyncService() => _instance;
  RealTimeSyncService._internal();

  final ApiService _apiService = ApiService();
  Timer? _syncTimer;
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;
  bool _isOnline = true;
  Map<String, dynamic>? _lastKnownSalonData;

  // Callbacks for UI updates
  Function(Map<String, dynamic>)? onSalonStatusUpdate;
  Function(List<Map<String, dynamic>>)? onSalonsUpdate;
  Function(String)? onSyncError;

  // Start real-time sync
  void startSync() {
    // Listen for connectivity changes
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((result) {
      _isOnline = result != ConnectivityResult.none;
      if (_isOnline) {
        _syncData();
      }
    });

    // Start periodic sync (every 30 seconds)
    _syncTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (_isOnline) {
        _syncData();
      }
    });

    // Initial sync
    _syncData();
  }

  // Stop real-time sync
  void stopSync() {
    _syncTimer?.cancel();
    _connectivitySubscription?.cancel();
  }

  // Sync data from server
  Future<void> _syncData() async {
    try {
      if (!_isOnline) return;

      // Sync salon data
      await _syncSalonData();
    } catch (e) {
      onSyncError?.call('Sync error: $e');
    }
  }

  // Sync salon data
  Future<void> _syncSalonData() async {
    try {
      final salons = await _apiService.getSalons();
      
      // Notify UI of salon updates
      onSalonsUpdate?.call(salons);

      // Check for individual salon status changes
      for (final salon in salons) {
        final salonId = salon['id']?.toString();
        if (salonId != null) {
          final detailedSalon = await _apiService.getSalon(salonId);
          
          // Check if status changed
          if (_lastKnownSalonData?[salonId]?['status'] != detailedSalon['status']) {
            onSalonStatusUpdate?.call(detailedSalon);
          }
          
          _lastKnownSalonData ??= {};
          _lastKnownSalonData![salonId] = detailedSalon;
        }
      }
    } catch (e) {
      onSyncError?.call('Failed to sync salon data: $e');
    }
  }

  // Get real-time salon status
  Future<Map<String, dynamic>> getSalonRealTimeStatus(String salonId) async {
    try {
      final salon = await _apiService.getSalon(salonId);
      return {
        'status': salon['status'] ?? 'Unknown',
        'waitingTime': salon['waitingTime'] ?? '0',
        'homeServiceAvailable': salon['homeServiceAvailable'] ?? false,
        'lastUpdated': DateTime.now().toIso8601String(),
      };
    } catch (e) {
      return {
        'status': 'Offline',
        'waitingTime': 'N/A',
        'homeServiceAvailable': false,
        'lastUpdated': DateTime.now().toIso8601String(),
        'error': e.toString(),
      };
    }
  }

  // Get real-time availability
  Future<List<Map<String, dynamic>>> getRealTimeAvailability(String salonId, String date) async {
    try {
      return await _apiService.getSalonAvailability(salonId, date);
    } catch (e) {
      return [];
    }
  }

  // Force immediate sync
  Future<void> forceSync() async {
    await _syncData();
  }

  // Check connectivity
  bool get isOnline => _isOnline;

  // Get last sync time
  DateTime? get lastSyncTime => _lastKnownSalonData != null 
    ? DateTime.tryParse(_lastKnownSalonData!['lastSync']?.toString() ?? '')
    : null;

  // Cleanup
  void dispose() {
    stopSync();
    onSalonStatusUpdate = null;
    onSalonsUpdate = null;
    onSyncError = null;
  }
}

// Salon status manager for individual salon tracking
class SalonStatusManager {
  static final Map<String, SalonStatusManager> _instances = {};
  
  factory SalonStatusManager(String salonId) {
    return _instances.putIfAbsent(salonId, () => SalonStatusManager._internal(salonId));
  }

  SalonStatusManager._internal(this.salonId);

  final String salonId;
  final RealTimeSyncService _syncService = RealTimeSyncService();
  Timer? _statusTimer;
  Map<String, dynamic>? _currentStatus;

  // Callbacks
  Function(Map<String, dynamic>)? onStatusChange;
  Function(String)? onError;

  // Start tracking this salon
  void startTracking() {
    _statusTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      _updateStatus();
    });
    
    _updateStatus();
  }

  // Stop tracking
  void stopTracking() {
    _statusTimer?.cancel();
  }

  // Update status
  Future<void> _updateStatus() async {
    try {
      final status = await _syncService.getSalonRealTimeStatus(salonId);
      
      if (_currentStatus?['status'] != status['status']) {
        _currentStatus = status;
        onStatusChange?.call(status);
      }
    } catch (e) {
      onError?.call(e.toString());
    }
  }

  // Get current status
  Map<String, dynamic>? get currentStatus => _currentStatus;

  // Check if salon is available
  bool get isAvailable => _currentStatus?['status'] == 'Available';

  // Get waiting time
  String get waitingTime => _currentStatus?['waitingTime']?.toString() ?? '0';

  // Check if home service is available
  bool get homeServiceAvailable => _currentStatus?['homeServiceAvailable'] == true;

  // Cleanup
  void dispose() {
    stopTracking();
    onStatusChange = null;
    onError = null;
  }
}
