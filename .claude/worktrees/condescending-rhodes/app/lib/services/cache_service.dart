import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

/// Simple cache service using SharedPreferences for offline data
class CacheService {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  static Future<SharedPreferences> _getPrefs() async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  // ── Doctors Cache ─────────────────────────────────────────────────────
  static Future<void> cacheDoctors(List<Doctor> doctors) async {
    final prefs = await _getPrefs();
    final jsonList = doctors.map((d) => d.toJson()).toList();
    await prefs.setString('cache_doctors', json.encode(jsonList));
    await prefs.setInt('cache_doctors_ts', DateTime.now().millisecondsSinceEpoch);
  }

  static Future<List<Doctor>?> getCachedDoctors() async {
    final prefs = await _getPrefs();
    final raw = prefs.getString('cache_doctors');
    if (raw == null) return null;
    try {
      final list = json.decode(raw) as List;
      return list.map((e) => Doctor.fromJson(e)).toList();
    } catch (_) {
      return null;
    }
  }

  // ── Emergency Contacts Cache ──────────────────────────────────────────
  static Future<void> cacheEmergencyContacts(Map<String, List<EmergencyContact>> contacts) async {
    final prefs = await _getPrefs();
    final map = <String, dynamic>{};
    contacts.forEach((key, value) {
      map[key] = value.map((c) => c.toJson()).toList();
    });
    await prefs.setString('cache_emergency', json.encode(map));
    await prefs.setInt('cache_emergency_ts', DateTime.now().millisecondsSinceEpoch);
  }

  static Future<Map<String, List<EmergencyContact>>?> getCachedEmergencyContacts() async {
    final prefs = await _getPrefs();
    final raw = prefs.getString('cache_emergency');
    if (raw == null) return null;
    try {
      final decoded = json.decode(raw) as Map<String, dynamic>;
      final map = <String, List<EmergencyContact>>{};
      decoded.forEach((key, value) {
        map[key] = (value as List)
            .map((e) => EmergencyContact.fromJson(e))
            .toList();
      });
      return map;
    } catch (_) {
      return null;
    }
  }

  // ── Local Services Cache ──────────────────────────────────────────────
  static Future<void> cacheLocalServices(Map<String, List<Map<String, dynamic>>> services) async {
    final prefs = await _getPrefs();
    final map = <String, dynamic>{};
    services.forEach((key, value) {
      map[key] = value;
    });
    await prefs.setString('cache_services', json.encode(map));
    await prefs.setInt('cache_services_ts', DateTime.now().millisecondsSinceEpoch);
  }

  static Future<Map<String, List<Map<String, dynamic>>>?> getCachedLocalServices() async {
    final prefs = await _getPrefs();
    final raw = prefs.getString('cache_services');
    if (raw == null) return null;
    try {
      final decoded = json.decode(raw) as Map<String, dynamic>;
      final map = <String, List<Map<String, dynamic>>>{};
      decoded.forEach((key, value) {
        map[key] = (value as List).map((e) => Map<String, dynamic>.from(e as Map)).toList();
      });
      return map;
    } catch (_) {
      return null;
    }
  }
}
