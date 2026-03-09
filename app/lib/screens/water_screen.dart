import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/prefs_service.dart';
import '../theme/app_theme.dart';
import '../widgets/offline_banner.dart';

class WaterScreen extends StatefulWidget {
  const WaterScreen({super.key});

  @override
  State<WaterScreen> createState() => _WaterScreenState();
}

class _WaterScreenState extends State<WaterScreen> {
  WaterSchedule? _schedule;
  List<WaterAlert> _todayAlerts = [];
  bool _loading = true;
  bool _offline = false;
  bool _alertSent = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final streetId = PrefsService.streetId;
    if (streetId == null) {
      setState(() => _loading = false);
      return;
    }
    try {
      final schedule = await ApiService.getWaterSchedule(streetId);
      final alerts = await ApiService.getTodayWaterAlerts();
      setState(() {
        _schedule = schedule;
        _todayAlerts = alerts;
        _loading = false;
        _offline = false;
      });
    } catch (_) {
      setState(() {
        _loading = false;
        _offline = true;
      });
    }
  }

  Future<void> _reportWaterArrival() async {
    final streetId = PrefsService.streetId;
    if (streetId == null) return;

    final ok = await ApiService.reportWaterArrival(
      streetId,
      PrefsService.deviceId,
    );
    if (ok && mounted) {
      setState(() => _alertSent = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('💧 அறிவிப்பு அனுப்பப்பட்டது! அனைவருக்கும் தகவல் போகும்.'),
          backgroundColor: AppColors.waterBlue,
          duration: Duration(seconds: 4),
        ),
      );
      await _load();
    }
  }

  Future<void> _confirmAlert(int alertId) async {
    await ApiService.confirmWaterAlert(alertId);
    await _load();
  }

  String _formatTime(String timeStr) {
    final parts = timeStr.split(':');
    final h = int.parse(parts[0]);
    final m = int.parse(parts[1]);
    final period = h < 12 ? 'காலை' : h < 17 ? 'பகல்' : 'மாலை';
    final displayH = h > 12 ? h - 12 : (h == 0 ? 12 : h);
    return '$displayH:${m.toString().padLeft(2, '0')} $period';
  }

  String _formatAlertTime(DateTime dt) {
    return DateFormat('h:mm a').format(dt);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.waterBlue,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('தண்ணீர்'),
            Text('Water Supply', style: TextStyle(fontSize: 12, fontWeight: FontWeight.normal)),
          ],
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: Icon(Icons.water_drop, size: 28),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: _buildBody(),
            ),
    );
  }

  Widget _buildBody() {
    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 8),
      children: [
        if (_offline) const OfflineBanner(),

        // Street indicator
        GestureDetector(
          onTap: () {
            // Navigate back to allow street change
            Navigator.pop(context);
          },
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.waterBlue.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.waterBlue.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.location_on, color: AppColors.waterBlue, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _schedule?.streetNameTamil ?? PrefsService.streetNameTamil,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500, color: AppColors.waterBlue),
                      ),
                      const Text('உங்கள் தெரு — Your street  (தட்டி மாற்றவும்)', style: TextStyle(fontFamily: 'Roboto', fontSize: 11, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                const Icon(Icons.edit, size: 16, color: AppColors.textSecondary),
              ],
            ),
          ),
        ),

        // Schedule card
        if (_schedule != null)
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.calendar_today, color: AppColors.waterBlue, size: 20),
                      SizedBox(width: 8),
                      Text('📅 அடுத்த தண்ணீர்', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500)),
                    ],
                  ),
                  const Divider(height: 20),
                  if (_schedule!.nextSupplyDate != null) ...[
                    Text(
                      _schedule!.nextSupplyDate!,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.waterBlue),
                    ),
                    const SizedBox(height: 4),
                  ],
                  Row(
                    children: [
                      const Icon(Icons.access_time, color: AppColors.waterBlue, size: 18),
                      const SizedBox(width: 6),
                      Text(
                        _formatTime(_schedule!.supplyTime),
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'ஒவ்வொரு ${_schedule!.frequencyDays} நாளுக்கு ஒரு முறை  •  Every ${_schedule!.frequencyDays} days',
                    style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
          )
        else
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                _offline
                    ? 'இணைப்பு இல்லை — தண்ணீர் நேரம் காட்ட முடியவில்லை\nOffline — water schedule unavailable'
                    : 'இன்று தண்ணீர் நாள் இல்லை\nNo water today',
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ),

        const SizedBox(height: 8),

        // Community alert button — THE KILLER FEATURE
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: ElevatedButton(
            onPressed: _alertSent ? null : _reportWaterArrival,
            style: ElevatedButton.styleFrom(
              backgroundColor: _alertSent ? Colors.green : AppColors.waterBlue,
              minimumSize: const Size(double.infinity, 64),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Column(
              children: [
                Text(
                  _alertSent ? '✅ அறிவிப்பு அனுப்பப்பட்டது!' : '💧 தண்ணீர் வந்தது!',
                  style: const TextStyle(fontSize: 22, color: Colors.white, fontWeight: FontWeight.bold),
                ),
                Text(
                  _alertSent ? 'Alert sent!' : 'Water has come! — Tap to alert everyone',
                  style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Colors.white70),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Today's community alerts
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              const Icon(Icons.history, size: 18, color: AppColors.textSecondary),
              const SizedBox(width: 6),
              const Text('🕐 இன்றைய அறிவிப்புகள்', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
              const SizedBox(width: 8),
              Text(
                "Today's community alerts",
                style: const TextStyle(fontFamily: 'Roboto', fontSize: 11, color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
        const SizedBox(height: 6),

        if (_todayAlerts.isEmpty)
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Icon(Icons.water_drop_outlined, size: 40, color: Colors.grey[400]),
                  const SizedBox(height: 8),
                  const Text('இன்னும் யாரும் அறிவிக்கவில்லை', style: TextStyle(fontSize: 16)),
                  const Text('No alerts yet today', style: TextStyle(fontFamily: 'Roboto', fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
            ),
          )
        else
          ..._todayAlerts.map((alert) => Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppColors.waterBlue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(22),
                        ),
                        child: const Icon(Icons.water_drop, color: AppColors.waterBlue, size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '💧 ${alert.streetNameTamil}',
                              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w500),
                            ),
                            Text(
                              _formatAlertTime(alert.reportedAt),
                              style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        children: [
                          if (alert.confirmations > 0)
                            Text(
                              '✅ ${alert.confirmations}',
                              style: const TextStyle(fontSize: 16, color: Colors.green, fontWeight: FontWeight.bold),
                            ),
                          TextButton(
                            onPressed: () => _confirmAlert(alert.id),
                            child: const Text('உறுதிப்படுத்து', style: TextStyle(fontSize: 13)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              )),
      ],
    );
  }
}
