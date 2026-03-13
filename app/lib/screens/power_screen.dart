import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/prefs_service.dart';
import '../theme/app_theme.dart';
import '../widgets/call_button.dart';
import '../widgets/offline_banner.dart';

class PowerScreen extends StatefulWidget {
  const PowerScreen({super.key});

  @override
  State<PowerScreen> createState() => _PowerScreenState();
}

class _PowerScreenState extends State<PowerScreen> {
  List<PowerCut> _cuts = [];
  bool _loading = true;
  bool _offline = false;
  bool _restoredSent = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final cuts = await ApiService.getPowerCuts();
      if (!mounted) return;
      setState(() {
        _cuts = cuts;
        _loading = false;
        _offline = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _cuts = [];
        _loading = false;
        _offline = true;
      });
    }
  }

  Future<void> _reportRestored(int cutId) async {
    final ok = await ApiService.reportPowerRestored(cutId, PrefsService.deviceId);
    if (ok && mounted) {
      setState(() => _restoredSent = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ தகவல் அனுப்பப்பட்டது! நன்றி.'),
          backgroundColor: AppColors.primary,
        ),
      );
      await _load();
    }
  }

  bool get _hasCutToday {
    final now = DateTime.now();
    return _cuts.any((c) {
      final sameDay = c.startTime.year == now.year &&
          c.startTime.month == now.month &&
          c.startTime.day == now.day;
      return sameDay && !c.isResolved;
    });
  }

  PowerCut? get _activeCut {
    final now = DateTime.now();
    try {
      return _cuts.firstWhere(
        (c) => c.startTime.isBefore(now) &&
            (c.endTime == null || c.endTime!.isAfter(now)) &&
            !c.isResolved,
      );
    } catch (_) {
      return null;
    }
  }

  String _formatDatetime(DateTime dt) {
    return DateFormat('d MMM, h:mm a').format(dt);
  }

  String _formatDuration(DateTime start, DateTime? end) {
    if (end == null) return 'முடியும் நேரம் தெரியவில்லை';
    final diff = end.difference(start);
    return '${diff.inHours} மணி நேரம் (${diff.inHours}h)';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.powerYellow,
        foregroundColor: Colors.black87,
        title: const Text('மின்சாரம் | Electricity', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16, color: Colors.black87)),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: Icon(Icons.bolt, size: 28, color: Colors.black87),
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
    final active = _activeCut;

    // Hero tile status
    final String heroEmoji = active != null ? '⚡' : _hasCutToday ? '⚠️' : '🟢';
    final String heroStatus = active != null
        ? 'மின் தடை நடக்கிறது!'
        : _hasCutToday
            ? 'இன்று மின் தடை உள்ளது'
            : 'இன்று கரண்ட் இருக்கு!';
    final List<Color> heroColors = active != null
        ? [const Color(0xFFB71C1C), const Color(0xFFE53935)]
        : _hasCutToday
            ? [const Color(0xFFE65100), const Color(0xFFFFA726)]
            : [const Color(0xFF2E7D32), const Color(0xFF66BB6A)];

    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 8),
      children: [
        if (_offline) const OfflineBanner(),

        // ── HERO TILE ─────────────────────────────────────────────
        Container(
          width: double.infinity,
          margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: heroColors, begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(22),
            boxShadow: [BoxShadow(color: heroColors[0].withOpacity(0.35), blurRadius: 14, offset: const Offset(0, 6))],
          ),
          child: Column(
            children: [
              Text(heroEmoji, style: const TextStyle(fontSize: 44)),
              const SizedBox(height: 10),
              const Text(
                'உங்க வீட்ல கரண்ட் இருக்கா?',
                style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.22), borderRadius: BorderRadius.circular(20)),
                child: Text(
                  heroStatus,
                  style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 18, color: Colors.white, fontWeight: FontWeight.w600),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
        // ── END HERO TILE ─────────────────────────────────────────

        // Status card
        Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          color: active != null
              ? Colors.red[50]
              : _hasCutToday
                  ? Colors.orange[50]
                  : Colors.green[50],
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  active != null ? Icons.power_off : Icons.power,
                  size: 40,
                  color: active != null
                      ? Colors.red
                      : _hasCutToday
                          ? Colors.orange
                          : Colors.green,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        active != null
                            ? '⚡ மின் தடை நடக்கிறது!'
                            : _hasCutToday
                                ? '⚠️ இன்று மின் தடை உள்ளது'
                                : '🟢 இன்று மின் தடை இல்லை',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: active != null
                              ? Colors.red[800]
                              : _hasCutToday
                                  ? Colors.orange[800]
                                  : Colors.green[800],
                        ),
                      ),
                      Text(
                        active != null
                            ? 'Power cut in progress'
                            : _hasCutToday
                                ? 'Power cut scheduled today'
                                : 'No power cut today',
                        style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // Active cut detail
        if (active != null) ...[
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            color: Colors.red[50],
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: active.isPlanned ? Colors.orange : Colors.red,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          active.isPlanned ? 'திட்டமிட்டது  Planned' : '🔴 கோளாறு  Fault',
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _infoRow('தொடங்கியது', 'Started', _formatDatetime(active.startTime)),
                  if (active.endTime != null)
                    _infoRow('முடியும்', 'Expected end', _formatDatetime(active.endTime!)),
                  if (active.reasonTamil != null)
                    _infoRow('காரணம்', 'Reason', active.reasonTamil!),
                  const SizedBox(height: 12),
                  // Report restored button
                  ElevatedButton.icon(
                    onPressed: _restoredSent ? null : () => _reportRestored(active.id),
                    icon: const Icon(Icons.check_circle_outline),
                    label: const Column(
                      children: [
                        Text('✅ என் தெருவில் மின்சாரம் வந்துவிட்டது'),
                        Text('Power restored in my street', style: TextStyle(fontFamily: 'Roboto', fontSize: 11)),
                      ],
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      minimumSize: const Size(double.infinity, 52),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],

        // Upcoming cuts
        if (_cuts.where((c) => c.startTime.isAfter(DateTime.now()) && !c.isResolved).isNotEmpty) ...[
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text('📅 அடுத்த திட்டமிட்ட மின் தடைகள்', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
          ),
          ..._cuts
              .where((c) => c.startTime.isAfter(DateTime.now()) && !c.isResolved)
              .map((c) => _buildCutCard(c)),
        ] else if (active == null) ...[
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Icon(Icons.bolt, color: Colors.green, size: 48),
                  const SizedBox(height: 8),
                  const Text('அடுத்த சில நாட்களில் மின் தடை அறிவிக்கப்படவில்லை', style: TextStyle(fontSize: 16), textAlign: TextAlign.center),
                  const SizedBox(height: 4),
                  Text('No power cuts announced', style: TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Colors.grey[600])),
                ],
              ),
            ),
          ),
        ],

        const SizedBox(height: 16),

        // TNEB contact numbers
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Text('📞 புகார் செய்ய அழைக்க', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
        ),
        CallButton(
          phone: '9498794987',
          label: 'TNEB உள்ளூர் புகார் ✅',
          sublabel: '94987 94987  •  TNEB Local Complaint',
          color: AppColors.powerYellow,
        ),
        CallButton(
          phone: '1912',
          label: 'TNEB தேசிய எண்',
          sublabel: '1912  •  TNEB National Fault Line',
          color: AppColors.powerYellow,
        ),
      ],
    );
  }

  Widget _buildCutCard(PowerCut cut) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: cut.isPlanned ? Colors.orange[100] : Colors.red[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    cut.isPlanned ? 'திட்டமிட்டது' : 'கோளாறு',
                    style: TextStyle(
                      fontSize: 12,
                      color: cut.isPlanned ? Colors.orange[900] : Colors.red[900],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            _infoRow('தேதி', 'Date', _formatDatetime(cut.startTime)),
            if (cut.endTime != null)
              _infoRow('நேரம்', 'Duration', _formatDuration(cut.startTime, cut.endTime)),
            if (cut.reasonTamil != null)
              _infoRow('காரணம்', 'Reason', cut.reasonTamil!),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String labelTamil, String labelEnglish, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(labelTamil, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                Text(labelEnglish, style: const TextStyle(fontFamily: 'Roboto', fontSize: 10, color: AppColors.textSecondary)),
              ],
            ),
          ),
          const Text(' : ', style: TextStyle(fontSize: 14)),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 15))),
        ],
      ),
    );
  }
}
