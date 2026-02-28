class AppConfig {
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.blushrz.com',
  );

  static const String _environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'production',
  );

  static String get apiBaseUrl {
    switch (_environment) {
      case 'development':
        return 'http://localhost:3000/api';
      case 'staging':
        return 'https://staging-api.blushrz.com/api';
      case 'production':
      default:
        return '$_baseUrl/api';
    }
  }

  static String get environment => _environment;
  static bool get isDevelopment => _environment == 'development';
  static bool get isStaging => _environment == 'staging';
  static bool get isProduction => _environment == 'production';

  // API Endpoints
  static const String auth = '/auth';
  static const String salons = '/salons';
  static const String services = '/services';
  static const String bookings = '/bookings';
  static const String payments = '/payments';
  static const String notifications = '/notifications';
  static const String users = '/users';

  // Timeout durations
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);
}
