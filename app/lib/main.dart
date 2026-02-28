import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'pages/splash_screen.dart';
import 'services/storage_service.dart';
import 'services/theme_service.dart';
import 'services/realtime_sync_service.dart';
import 'services/notification_service.dart';
import 'config/app_config.dart';

// Background message handler
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  if (AppConfig.isDevelopment) {
    print('Handling a background message: ${message.messageId}');
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  
  // Set background message handler
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  
  // Initialize notification service
  await NotificationService().initialize();
  
  // Initialize real-time sync service
  RealTimeSyncService().startSync();
  
  runApp(const SalonBookingApp());
}

class SalonBookingApp extends StatelessWidget {
  const SalonBookingApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => ThemeService(),
      child: Consumer<ThemeService>(
        builder: (context, themeService, child) {
          return MaterialApp(
            title: 'Salon Booking',
            debugShowCheckedModeBanner: false,
            theme: themeService.lightTheme,
            home: const SplashScreen(),
          );
        },
      ),
    );
  }
}
