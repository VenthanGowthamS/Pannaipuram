import 'package:shared_preferences/shared_preferences.dart';

class PrefsService {
  static const _keyStreetId = 'selected_street_id';
  static const _keyStreetName = 'selected_street_name';
  static const _keyOnboarded = 'onboarding_done';
  static const _keyDeviceId = 'device_id';

  static late SharedPreferences _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static bool get isOnboarded => _prefs.getBool(_keyOnboarded) ?? false;

  static Future<void> setOnboarded() => _prefs.setBool(_keyOnboarded, true);

  static int? get streetId => _prefs.getInt(_keyStreetId);

  static String get streetNameTamil =>
      _prefs.getString(_keyStreetName) ?? 'தெரு தேர்வு செய்யவும்';

  static Future<void> saveStreet(int id, String nameTamil) async {
    await _prefs.setInt(_keyStreetId, id);
    await _prefs.setString(_keyStreetName, nameTamil);
  }

  // Default to Valluvar Street (id:1) if no street chosen yet
  static Future<void> ensureDefaultStreet() async {
    if (_prefs.getInt(_keyStreetId) == null) {
      await saveStreet(1, 'வள்ளுவர் தெரு');
    }
  }

  static String get deviceId {
    var id = _prefs.getString(_keyDeviceId);
    if (id == null) {
      id = 'device_${DateTime.now().millisecondsSinceEpoch}';
      _prefs.setString(_keyDeviceId, id);
    }
    return id;
  }
}
