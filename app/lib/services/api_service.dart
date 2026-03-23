import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  // ⚠️ After deploying to Render, replace the URL with your actual Render URL
  // static const _base = 'http://192.168.1.3:3000';           // Local Mac (dev)
  // static const _base = 'http://10.0.2.2:3000';              // Android emulator
  static const _base = 'https://pannaipuram-api.onrender.com'; // Production ← update this

  static Future<T> _get<T>(
    String path,
    T Function(dynamic) parser,
  ) async {
    final uri = Uri.parse('$_base$path');
    final res = await http.get(uri).timeout(const Duration(seconds: 30));
    if (res.statusCode == 200) {
      final decoded = json.decode(res.body);
      // Unwrap { success: true, data: ... } envelope from backend
      final payload = (decoded is Map && decoded.containsKey('data'))
          ? decoded['data']
          : decoded;
      return parser(payload);
    }
    throw Exception('API error ${res.statusCode} on $path');
  }

  static Future<http.Response> _post(
    String path,
    Map<String, dynamic> body,
  ) async {
    final uri = Uri.parse('$_base$path');
    return http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode(body),
    ).timeout(const Duration(seconds: 10));
  }

  // ─── Streets ─────────────────────────────────────────────────────────────

  static Future<List<Street>> getStreets() => _get(
        '/api/water/streets',
        (d) => (d as List).map((e) => Street.fromJson(e)).toList(),
      );

  // ─── Water ───────────────────────────────────────────────────────────────

  static Future<WaterSchedule> getWaterSchedule(int streetId) => _get(
        '/api/water/schedule/$streetId',
        (d) => WaterSchedule.fromJson(d),
      );

  static Future<List<WaterAlert>> getTodayWaterAlerts() => _get(
        '/api/water/alerts/today',
        (d) => (d as List).map((e) => WaterAlert.fromJson(e)).toList(),
      );

  static Future<bool> reportWaterArrival(int streetId, String deviceId) async {
    final res = await _post('/api/water/alert', {
      'street_id': streetId,
      'device_id': deviceId,
    });
    return res.statusCode == 201;
  }

  static Future<bool> confirmWaterAlert(int alertId) async {
    try {
      final uri = Uri.parse('$_base/api/water/alert/$alertId/confirm');
      final res = await http.post(uri).timeout(const Duration(seconds: 10));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // ─── Power ───────────────────────────────────────────────────────────────

  static Future<List<PowerCut>> getPowerCuts() => _get(
        '/api/power/cuts',
        (d) => (d as List).map((e) => PowerCut.fromJson(e)).toList(),
      );

  static Future<List<PowerCut>> getTodayPowerCuts() => _get(
        '/api/power/cuts/today',
        (d) => (d as List).map((e) => PowerCut.fromJson(e)).toList(),
      );

  static Future<bool> reportPowerRestored(int cutId, String deviceId) async {
    final res = await _post('/api/power/restored', {
      'power_cut_id': cutId,
      'device_id': deviceId,
    });
    return res.statusCode == 200 || res.statusCode == 201;
  }

  // ─── Bus ─────────────────────────────────────────────────────────────────

  static Future<List<BusCorridor>> getBusCorridors() => _get(
        '/api/bus/corridors',
        (d) => (d as List).map((e) => BusCorridor.fromJson(e)).toList(),
      );

  static Future<List<BusTiming>> getBusTimings(int corridorId) => _get(
        '/api/bus/timings/$corridorId',
        (d) => (d as List).map((e) => BusTiming.fromJson(e)).toList(),
      );

  static Future<List<NextBus>> getNextBuses() => _get(
        '/api/bus/next',
        (d) => (d as List).map((e) => NextBus.fromJson(e)).toList(),
      );

  // ─── Hospital ─────────────────────────────────────────────────────────────

  static Future<Hospital> getHospitalInfo() => _get(
        '/api/hospital/info',
        (d) => Hospital.fromJson(d),
      );

  static Future<List<Doctor>> getAllDoctors() => _get(
        '/api/hospital/doctors',
        (d) => (d as List).map((e) => Doctor.fromJson(e)).toList(),
      );

  static Future<List<Doctor>> getTodayDoctors() => _get(
        '/api/hospital/doctors/today',
        (d) => (d as List).map((e) => Doctor.fromJson(e)).toList(),
      );

  // ─── Emergency ────────────────────────────────────────────────────────────

  static Future<Map<String, List<EmergencyContact>>> getEmergencyContacts() =>
      _get('/api/emergency/contacts', (d) {
        final map = <String, List<EmergencyContact>>{};
        (d as Map<String, dynamic>).forEach((key, value) {
          map[key] = (value as List)
              .map((e) => EmergencyContact.fromJson(e))
              .toList();
        });
        return map;
      });

  // ─── Auto / Van Drivers ──────────────────────────────────────────────────

  static Future<List<AutoDriver>> getAutoDrivers() => _get(
        '/api/auto/drivers',
        (d) => (d as List).map((e) => AutoDriver.fromJson(e)).toList(),
      );

  static Future<Map<String, String>> getAutoContact() => _get(
        '/api/auto/contact',
        (d) => {
          'name': (d['name'] ?? 'கௌதம்').toString(),
          'name_english': (d['name_english'] ?? 'Gowtham').toString(),
          'phone': (d['phone'] ?? '8888888888').toString(),
        },
      );

  // ─── Local Services ───────────────────────────────────────────────────────

  static Future<Map<String, List<Map<String, dynamic>>>> getLocalServices() => _get(
        '/api/services',
        (d) {
          final map = <String, List<Map<String, dynamic>>>{};
          (d as Map<String, dynamic>).forEach((key, value) {
            map[key] = (value as List)
                .map((e) => Map<String, dynamic>.from(e as Map))
                .toList();
          });
          return map;
        },
      );

  // ─── Announcements ────────────────────────────────────────────────────────

  static Future<List<Map<String, dynamic>>> getAnnouncements() => _get(
        '/api/announcements',
        (d) => (d as List).map((e) => Map<String, dynamic>.from(e as Map)).toList(),
      );

  // ─── Device registration ─────────────────────────────────────────────────

  static Future<void> registerDevice(String fcmToken, int? streetId) async {
    await _post('/api/devices/register', {
      'fcm_token': fcmToken,
      if (streetId != null) 'street_id': streetId,
    });
  }

  static Future<void> updateDeviceStreet(String fcmToken, int streetId) async {
    try {
      final uri = Uri.parse('$_base/api/devices/street');
      await http.put(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'fcm_token': fcmToken, 'street_id': streetId}),
      ).timeout(const Duration(seconds: 10));
    } catch (_) {
      // Silently fail — device street update is non-critical
    }
  }

  // ─── Feedback ────────────────────────────────────────────────────────────

  static Future<void> submitFeedback({
    required String message,
    String? nameOrContact,
  }) async {
    final body = <String, dynamic>{'message': message};
    if (nameOrContact != null && nameOrContact.isNotEmpty) {
      body['name_or_contact'] = nameOrContact;
    }
    final res = await _post('/api/feedback', body);
    if (res.statusCode != 200 && res.statusCode != 201) {
      final decoded = json.decode(res.body);
      throw Exception(decoded['error'] ?? 'Failed to submit feedback');
    }
  }
}
