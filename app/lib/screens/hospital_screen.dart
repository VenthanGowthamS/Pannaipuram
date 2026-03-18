import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

// ═══════════════════════════════════════════════════════════════════════════
//  Hospital Landing — shows hospitals as cards, tap to see doctors inside
// ═══════════════════════════════════════════════════════════════════════════

class HospitalScreen extends StatelessWidget {
  const HospitalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF5F5),
      body: CustomScrollView(
        slivers: [
          // ── Header ───────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 160,
            pinned: true,
            backgroundColor: const Color(0xFFB71C1C),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFFB71C1C), Color(0xFFD32F2F), Color(0xFFEF5350)],
                  ),
                ),
                child: const SafeArea(
                  child: Padding(
                    padding: EdgeInsets.only(top: 44),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('🏥', style: TextStyle(fontSize: 34)),
                        SizedBox(height: 4),
                        Text(
                          'உடம்பு நன்றாக இருக்கிறதா?',
                          style: TextStyle(
                            fontFamily: 'NotoSansTamil',
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'Hospital & Clinic',
                          style: TextStyle(
                              fontFamily: 'Roboto',
                              fontSize: 12,
                              color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── Hospital cards ───────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(left: 4, bottom: 12),
                    child: Text(
                      'எந்த மருத்துவமனைக்கு போகணும்?',
                      style: TextStyle(
                        fontFamily: 'NotoSansTamil',
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF757575),
                      ),
                    ),
                  ),

                  // ── PTV Padmavathy Hospital ───────────────────────
                  _HospitalCard(
                    nameTamil: 'PTV பத்மாவதி மருத்துவமனை',
                    nameEnglish: 'PTV Padmavathy Hospital',
                    icon: Icons.local_hospital_rounded,
                    gradientColors: const [Color(0xFFB71C1C), Color(0xFFE53935)],
                    tagline: 'தேவாரம் அருகில் • பொது மருத்துவம்',
                    taglineEnglish: 'Near Thevaram • General Medicine',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const _HospitalDetailScreen(
                            hospitalId: 1,
                            hospitalName: 'PTV பத்மாவதி மருத்துவமனை',
                            accentColor: Color(0xFFB71C1C),
                            icon: Icons.local_hospital_rounded,
                          ),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 14),

                  // ── SP Clinic ─────────────────────────────────────
                  _HospitalCard(
                    nameTamil: 'S P Clinic',
                    nameEnglish: 'S P Clinic — Dr. Shanmugapriya',
                    icon: Icons.medical_services_rounded,
                    gradientColors: const [Color(0xFFE65100), Color(0xFFF57C00)],
                    tagline: 'பெண்கள் நலம் • பொது • சர்க்கரை நோய்',
                    taglineEnglish: "Women's Health • General • Diabetes",
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const _HospitalDetailScreen(
                            hospitalId: 2,
                            hospitalName: 'S P Clinic',
                            accentColor: Color(0xFFE65100),
                            icon: Icons.medical_services_rounded,
                          ),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 20),

                  // ── Emergency quick-call ──────────────────────────
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                          color: Colors.red.withOpacity(0.2), width: 1),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(22),
                          ),
                          child: const Icon(Icons.emergency_rounded,
                              color: Colors.red, size: 24),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'அவசர உதவி',
                                style: TextStyle(
                                  fontFamily: 'NotoSansTamil',
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFFB71C1C),
                                ),
                              ),
                              Text(
                                '108 — Ambulance • 104 — Health Helpline',
                                style: TextStyle(
                                  fontFamily: 'Roboto',
                                  fontSize: 12,
                                  color: Color(0xFF757575),
                                ),
                              ),
                            ],
                          ),
                        ),
                        _QuickCallButton(
                          label: '108',
                          onTap: () => _callNumber('108'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  static Future<void> _callNumber(String number) async {
    final uri = Uri(scheme: 'tel', path: number);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Hospital Card widget
// ═══════════════════════════════════════════════════════════════════════════

class _HospitalCard extends StatelessWidget {
  final String nameTamil;
  final String nameEnglish;
  final IconData icon;
  final List<Color> gradientColors;
  final String tagline;
  final String taglineEnglish;
  final VoidCallback onTap;

  const _HospitalCard({
    required this.nameTamil,
    required this.nameEnglish,
    required this.icon,
    required this.gradientColors,
    required this.tagline,
    required this.taglineEnglish,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: gradientColors,
          ),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: gradientColors[0].withOpacity(0.35),
              blurRadius: 12,
              offset: const Offset(0, 5),
            )
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(28),
              ),
              child: Icon(icon, color: Colors.white, size: 30),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    nameTamil,
                    style: const TextStyle(
                      fontFamily: 'NotoSansTamil',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    nameEnglish,
                    style: const TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 12,
                      color: Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    tagline,
                    style: const TextStyle(
                      fontFamily: 'NotoSansTamil',
                      fontSize: 12,
                      color: Colors.white60,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                color: Colors.white60, size: 28),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Quick call button
// ═══════════════════════════════════════════════════════════════════════════

class _QuickCallButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _QuickCallButton({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFFB71C1C),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.call, color: Colors.white, size: 16),
            const SizedBox(width: 6),
            Text(label,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Hospital Detail Screen — fetches doctors from API with offline fallback
// ═══════════════════════════════════════════════════════════════════════════

class _HospitalDetailScreen extends StatefulWidget {
  final int hospitalId;
  final String hospitalName;
  final Color accentColor;
  final IconData icon;

  const _HospitalDetailScreen({
    required this.hospitalId,
    required this.hospitalName,
    required this.accentColor,
    required this.icon,
  });

  @override
  State<_HospitalDetailScreen> createState() => _HospitalDetailScreenState();
}

class _HospitalDetailScreenState extends State<_HospitalDetailScreen> {
  List<Doctor>? _apiDoctors;
  bool _loading = true;
  bool _offline = false;

  static const _daysTamil = [
    'ஞாயிறு', 'திங்கள்', 'செவ்வாய்',
    'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி',
  ];
  static const _daysEnglish = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
  ];

  @override
  void initState() {
    super.initState();
    _fetchDoctors();
  }

  Future<void> _fetchDoctors() async {
    try {
      final allDoctors = await ApiService.getAllDoctors();
      // Filter doctors for this specific hospital
      final doctors = allDoctors
          .where((d) => d.hospitalId == null || d.hospitalId == widget.hospitalId)
          .toList();
      if (!mounted) return;
      setState(() {
        _apiDoctors = doctors;
        _loading = false;
        _offline = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _offline = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final todayDow = DateTime.now().weekday % 7; // 0=Sun

    return Scaffold(
      backgroundColor: const Color(0xFFFAF5F5),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 140,
            pinned: true,
            backgroundColor: widget.accentColor,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [widget.accentColor, widget.accentColor.withOpacity(0.7)],
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 44),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(widget.icon, color: Colors.white, size: 30),
                          const SizedBox(height: 6),
                          Text(
                            widget.hospitalName,
                            style: const TextStyle(
                              fontFamily: 'NotoSansTamil',
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── Doctor cards ──────────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            sliver: SliverList(
              delegate: SliverChildListDelegate(
                _buildContent(todayDow),
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildContent(int todayDow) {
    final widgets = <Widget>[];

    widgets.add(_buildSectionLabel('டாக்டர்கள்', 'Doctors'));
    widgets.add(const SizedBox(height: 10));

    if (_loading) {
      widgets.add(const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: CircularProgressIndicator(),
        ),
      ));
      return widgets;
    }

    // Use API doctors if available, otherwise fallback
    if (_apiDoctors != null && _apiDoctors!.isNotEmpty) {
      for (final doc in _apiDoctors!) {
        widgets.add(_buildApiDoctorCard(doc, todayDow));
      }
      if (_offline) {
        widgets.add(_buildOfflineBanner());
      }
    } else if (_offline) {
      // Offline — show hardcoded fallback doctors
      widgets.add(_buildOfflineBanner());
      widgets.addAll(_buildFallbackDoctors(todayDow));
    } else {
      // API returned empty list
      widgets.add(_buildEmptyState());
    }

    // Call button for hospital
    widgets.add(const SizedBox(height: 16));
    widgets.add(_buildContactCard(
      label: 'மருத்துவமனை அழைக்க',
      sublabel: 'Call Hospital',
      icon: Icons.call,
      color: widget.accentColor,
    ));

    return widgets;
  }

  // ── Build doctor card from API Doctor model ─────────────────────────
  Widget _buildApiDoctorCard(Doctor doctor, int todayDow) {
    final availableToday =
        doctor.schedules.any((s) => s.dayOfWeek == todayDow);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 8,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Doctor name row
          Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: widget.accentColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Icon(Icons.person, color: widget.accentColor, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      doctor.nameTamil,
                      style: const TextStyle(
                        fontFamily: 'NotoSansTamil',
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      doctor.nameEnglish,
                      style: const TextStyle(
                        fontFamily: 'Roboto',
                        fontSize: 12,
                        color: Color(0xFF757575),
                      ),
                    ),
                    if (doctor.specialisation != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        doctor.specialisation!,
                        style: const TextStyle(
                          fontFamily: 'NotoSansTamil',
                          fontSize: 13,
                          color: Color(0xFF2E7D32),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (availableToday)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.green[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.green.withOpacity(0.3)),
                  ),
                  child: const Text(
                    'இன்று ✓',
                    style: TextStyle(
                      fontFamily: 'NotoSansTamil',
                      color: Colors.green,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),

          // Schedule section
          if (doctor.schedules.isNotEmpty) ...[
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFAFAFA),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'நேரம்',
                    style: TextStyle(
                      fontFamily: 'NotoSansTamil',
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF616161),
                    ),
                  ),
                  const SizedBox(height: 6),
                  ...doctor.schedules.map((s) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 3),
                        child: Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: s.dayOfWeek == todayDow
                                    ? Colors.green
                                    : Colors.grey[300],
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 10),
                            SizedBox(
                              width: 70,
                              child: Text(
                                _daysTamil[s.dayOfWeek],
                                style: TextStyle(
                                  fontFamily: 'NotoSansTamil',
                                  fontSize: 14,
                                  fontWeight: s.dayOfWeek == todayDow
                                      ? FontWeight.w700
                                      : FontWeight.w400,
                                  color: s.dayOfWeek == todayDow
                                      ? widget.accentColor
                                      : const Color(0xFF424242),
                                ),
                              ),
                            ),
                            Text(
                              _daysEnglish[s.dayOfWeek],
                              style: const TextStyle(
                                fontFamily: 'Roboto',
                                fontSize: 11,
                                color: Color(0xFF9E9E9E),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                s.notesTamil ?? '${s.startTime ?? ''} – ${s.endTime ?? ''}',
                                style: const TextStyle(
                                  fontFamily: 'NotoSansTamil',
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ── Hardcoded fallback doctors (used when offline) ────────────────
  List<Widget> _buildFallbackDoctors(int todayDow) {
    // Only show fallback doctor that belongs to this hospital
    final allFallback = [
      Doctor(
        id: -1,
        hospitalId: 1, // PTV Padmavathy
        nameTamil: 'டாக்டர் சேகர்',
        nameEnglish: 'Dr. Sekar',
        specialisation: 'பொது மருத்துவம்',
        schedules: [
          DoctorSchedule(dayOfWeek: 3, notesTamil: 'காலை முதல் மாலை வரை'),
        ],
      ),
      Doctor(
        id: -2,
        hospitalId: 2, // SP Clinic
        nameTamil: 'டாக்டர் ஷண்முகப்ரியா',
        nameEnglish: 'Dr. Shanmugapriya',
        specialisation: 'பெண்கள் நலம் • பொது • சர்க்கரை நோய்',
        schedules: [
          for (int i = 0; i < 7; i++)
            DoctorSchedule(dayOfWeek: i, notesTamil: 'மாலை 4 – இரவு 8'),
        ],
      ),
    ];
    final fallbackDoctors = allFallback
        .where((d) => d.hospitalId == widget.hospitalId)
        .toList();

    return fallbackDoctors
        .map((d) => _buildApiDoctorCard(d, todayDow))
        .toList();
  }

  Widget _buildOfflineBanner() {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.orange[50],
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.orange.withOpacity(0.3)),
      ),
      child: const Row(
        children: [
          Icon(Icons.wifi_off_rounded, color: Colors.orange, size: 18),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'இணையம் இல்லை — cached data காட்டுகிறது',
              style: TextStyle(
                fontFamily: 'NotoSansTamil',
                fontSize: 12,
                color: Colors.orange,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String tamil, String english) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Row(
        children: [
          Text(
            tamil,
            style: const TextStyle(
              fontFamily: 'NotoSansTamil',
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF424242),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            english,
            style: const TextStyle(
              fontFamily: 'Roboto',
              fontSize: 12,
              color: Color(0xFF9E9E9E),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactCard({
    required String label,
    required String sublabel,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
                Text(
                  sublabel,
                  style: const TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 12,
                    color: Color(0xFF757575),
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: Color(0xFF9E9E9E)),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(Icons.person_off, size: 48, color: Colors.grey[400]),
          const SizedBox(height: 8),
          const Text(
            'டாக்டர் தகவல் விரைவில் வரும்',
            style: TextStyle(
              fontFamily: 'NotoSansTamil',
              fontSize: 15,
              color: Color(0xFF757575),
            ),
          ),
        ],
      ),
    );
  }
}
