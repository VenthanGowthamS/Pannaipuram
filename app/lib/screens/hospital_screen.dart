import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/cache_service.dart';

// ═══════════════════════════════════════════════════════════════════════════
//  Hospital Landing — shows hospitals as cards, tap to see doctors inside
// ═══════════════════════════════════════════════════════════════════════════

class HospitalScreen extends StatefulWidget {
  const HospitalScreen({super.key});

  @override
  State<HospitalScreen> createState() => _HospitalScreenState();
}

class _HospitalScreenState extends State<HospitalScreen> {
  List<Hospital> _hospitals = [];
  bool _loading = true;

  // Visual styles for hospitals (cycles if more are added)
  static const _styles = [
    (colors: [Color(0xFFB71C1C), Color(0xFFE53935)], icon: Icons.local_hospital_rounded),
    (colors: [Color(0xFFE65100), Color(0xFFF57C00)], icon: Icons.medical_services_rounded),
    (colors: [Color(0xFF1565C0), Color(0xFF1E88E5)], icon: Icons.local_hospital_rounded),
    (colors: [Color(0xFF2E7D32), Color(0xFF43A047)], icon: Icons.medical_services_rounded),
  ];

  // Hardcoded fallback when API is unreachable
  static const _fallbackHospitals = [
    Hospital(id: 1, nameTamil: 'PTV பத்மாவதி மருத்துவமனை', nameEnglish: 'PTV Padmavathy Hospital', addressTamil: 'தேவாரம் அருகில்'),
    Hospital(id: 2, nameTamil: 'S P கிளினிக்', nameEnglish: 'S P Clinic', addressTamil: 'பண்ணைப்புரம்'),
  ];

  @override
  void initState() {
    super.initState();
    _fetchHospitals();
  }

  Future<void> _fetchHospitals() async {
    try {
      final list = await ApiService.getHospitals();
      if (!mounted) return;
      setState(() { _hospitals = list; _loading = false; });
    } catch (_) {
      if (!mounted) return;
      setState(() { _hospitals = _fallbackHospitals; _loading = false; });
    }
  }

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

          // ── Hospital cards (dynamic from API) ──────────────────
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

                  if (_loading)
                    const Center(child: Padding(
                      padding: EdgeInsets.all(24),
                      child: CircularProgressIndicator(color: Color(0xFFB71C1C)),
                    ))
                  else
                    ..._hospitals.asMap().entries.map((entry) {
                      final i = entry.key;
                      final h = entry.value;
                      final style = _styles[i % _styles.length];
                      return Padding(
                        padding: EdgeInsets.only(bottom: i < _hospitals.length - 1 ? 14 : 0),
                        child: _HospitalCard(
                          nameTamil: h.nameTamil,
                          nameEnglish: h.nameEnglish,
                          icon: style.icon,
                          gradientColors: style.colors,
                          tagline: h.addressTamil ?? '',
                          taglineEnglish: h.nameEnglish,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => _HospitalDetailScreen(
                                  hospitalId: h.id,
                                  hospitalName: h.nameTamil,
                                  accentColor: style.colors[0],
                                  icon: style.icon,
                                  hospitalPhone: h.phoneCasualty ?? '',
                                ),
                              ),
                            );
                          },
                        ),
                      );
                    }),

                  const SizedBox(height: 20),

                  // ── Emergency quick-call ──────────────────────────
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                          color: Colors.red.withValues(alpha: 0.2), width: 1),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: Colors.red.withValues(alpha: 0.1),
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
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                '108 — Ambulance • 104 — Health Helpline',
                                style: TextStyle(
                                  fontFamily: 'Roboto',
                                  fontSize: 12,
                                  color: Color(0xFF757575),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
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
              color: gradientColors[0].withValues(alpha: 0.35),
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
                color: Colors.white.withValues(alpha: 0.2),
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
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    nameEnglish,
                    style: const TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 12,
                      color: Colors.white70,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    tagline,
                    style: const TextStyle(
                      fontFamily: 'NotoSansTamil',
                      fontSize: 12,
                      color: Colors.white60,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
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
  final String hospitalPhone; // empty = no number yet

  const _HospitalDetailScreen({
    required this.hospitalId,
    required this.hospitalName,
    required this.accentColor,
    required this.icon,
    this.hospitalPhone = '',
  });

  @override
  State<_HospitalDetailScreen> createState() => _HospitalDetailScreenState();
}

class _HospitalDetailScreenState extends State<_HospitalDetailScreen> {
  List<Doctor>? _apiDoctors;
  bool _loading = true;
  bool _offline = false;
  Timer? _refreshTimer;

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
    _refreshTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (mounted) _fetchDoctors();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchDoctors() async {
    if (!_loading) {
      setState(() => _loading = true);
    }
    try {
      final allDoctors = await ApiService.getAllDoctors();
      // Cache the doctors data for offline use
      await CacheService.cacheDoctors(allDoctors);
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
      // Try loading from cache
      final cached = await CacheService.getCachedDoctors();
      if (cached != null && cached.isNotEmpty) {
        final doctors = cached
            .where((d) => d.hospitalId == null || d.hospitalId == widget.hospitalId)
            .toList();
        if (!mounted) return;
        setState(() {
          _apiDoctors = doctors;
          _loading = false;
          _offline = true;
        });
      } else {
        if (!mounted) return;
        setState(() {
          _loading = false;
          _offline = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final todayDow = DateTime.now().weekday % 7; // 0=Sun

    return Scaffold(
      backgroundColor: const Color(0xFFFAF5F5),
      body: RefreshIndicator(
        onRefresh: _fetchDoctors,
        color: widget.accentColor,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
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
                      colors: [widget.accentColor, widget.accentColor.withValues(alpha: 0.7)],
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
      ),
    );
  }

  List<Widget> _buildContent(int todayDow) {
    final widgets = <Widget>[];

    widgets.add(_buildSectionLabel('டாக்டர்கள்', 'Doctors'));
    widgets.add(const SizedBox(height: 10));

    if (_loading) {
      widgets.add(Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Shimmer.fromColors(
            baseColor: Colors.grey[300]!,
            highlightColor: Colors.grey[100]!,
            child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
              Container(height: 140, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22))),
              const SizedBox(height: 12),
              Container(height: 80, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12))),
              const SizedBox(height: 12),
              Container(height: 80, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12))),
            ])),
          ),
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

    // Refresh hint
    widgets.add(const SizedBox(height: 8));
    widgets.add(const Center(
      child: Text(
        'கீழே இழுத்து புதுப்பிக்கவும் • Pull down to refresh',
        style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 11, color: Color(0xFF9E9E9E)),
      ),
    ));

    // Call button — only show when a phone number is available
    widgets.add(const SizedBox(height: 12));
    if (widget.hospitalPhone.isNotEmpty) {
      widgets.add(GestureDetector(
        onTap: () async {
          final uri = Uri(scheme: 'tel', path: widget.hospitalPhone);
          if (await canLaunchUrl(uri)) await launchUrl(uri);
        },
        child: _buildContactCard(
          label: 'மருத்துவமனை அழைக்க',
          sublabel: '${widget.hospitalPhone}  •  Call Hospital',
          icon: Icons.call,
          color: widget.accentColor,
        ),
      ));
    } else {
      widgets.add(Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: const Row(children: [
          Icon(Icons.phone_disabled_rounded, color: Color(0xFF9E9E9E), size: 20),
          SizedBox(width: 10),
          Text('தொலைபேசி எண் விரைவில் சேர்க்கப்படும்',
            style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 13, color: Color(0xFF9E9E9E))),
        ]),
      ));
    }

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
              color: Colors.black.withValues(alpha: 0.06),
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
                  color: widget.accentColor.withValues(alpha: 0.08),
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: availableToday ? Colors.green[50] : Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: availableToday
                        ? Colors.green.withValues(alpha: 0.3)
                        : Colors.grey.withValues(alpha: 0.3),
                  ),
                ),
                child: Text(
                  availableToday ? 'இன்று ✓' : 'இன்று இல்லை',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    color: availableToday ? Colors.green : Colors.grey[600],
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
                              width: 100,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
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
                                  Text(
                                    _daysEnglish[s.dayOfWeek],
                                    style: const TextStyle(
                                      fontFamily: 'Roboto',
                                      fontSize: 11,
                                      color: Color(0xFF9E9E9E),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
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
        border: Border.all(color: Colors.orange.withValues(alpha: 0.3)),
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
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
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
