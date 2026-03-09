import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/call_button.dart';
import '../widgets/offline_banner.dart';

class HospitalScreen extends StatefulWidget {
  const HospitalScreen({super.key});

  @override
  State<HospitalScreen> createState() => _HospitalScreenState();
}

class _HospitalScreenState extends State<HospitalScreen> {
  Hospital? _hospital;
  List<Doctor> _allDoctors = [];
  List<Doctor> _todayDoctors = [];
  bool _loading = true;
  bool _offline = false;
  bool _showingToday = true;

  static final Hospital _fallbackHospital = Hospital(
    id: 1,
    nameTamil: 'PTV பத்மாவதி மருத்துவமனை',
    nameEnglish: 'PTV Padmavathy Hospital',
  );

  static final List<Doctor> _fallbackDoctors = [
    Doctor(
      id: 1,
      nameTamil: 'டாக்டர் சேகர்',
      nameEnglish: 'Dr. Sekar',
      schedules: [
        DoctorSchedule(
          dayOfWeek: 3,
          notesTamil: 'காலை முதல் மாலை வரை',
        ),
      ],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final hospital = await ApiService.getHospitalInfo();
      final all = await ApiService.getAllDoctors();
      final today = await ApiService.getTodayDoctors();
      setState(() {
        _hospital = hospital;
        _allDoctors = all;
        _todayDoctors = today;
        _loading = false;
        _offline = false;
      });
    } catch (_) {
      final todayDow = DateTime.now().weekday % 7; // 0=Sun in our model
      setState(() {
        _hospital = _fallbackHospital;
        _allDoctors = _fallbackDoctors;
        _todayDoctors = _fallbackDoctors
            .where((d) => d.schedules.any((s) => s.dayOfWeek == todayDow))
            .toList();
        _loading = false;
        _offline = true;
      });
    }
  }

  Future<void> _call(String? number) async {
    if (number == null || number.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('தொலைபேசி எண் இன்னும் சேர்க்கப்படவில்லை')),
      );
      return;
    }
    final uri = Uri(scheme: 'tel', path: number);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  static const _daysTamil = [
    'ஞாயிறு', 'திங்கள்', 'செவ்வாய்',
    'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி',
  ];
  static const _daysEnglish = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.hospitalRed,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('மருத்துவமனை'),
            Text('Hospital', style: TextStyle(fontSize: 12, fontWeight: FontWeight.normal)),
          ],
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: Icon(Icons.local_hospital, size: 28),
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
    final h = _hospital!;
    return ListView(
      children: [
        if (_offline) const OfflineBanner(),

        // Hospital header card
        Card(
          margin: const EdgeInsets.fromLTRB(16, 12, 16, 6),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.hospitalRed.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Icon(Icons.local_hospital, color: AppColors.hospitalRed, size: 28),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(h.nameTamil, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          Text(h.nameEnglish, style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                  ],
                ),
                if (h.addressTamil != null) ...[
                  const SizedBox(height: 8),
                  const Divider(),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 16, color: AppColors.textSecondary),
                      const SizedBox(width: 8),
                      Expanded(child: Text(h.addressTamil!, style: const TextStyle(fontSize: 14))),
                    ],
                  ),
                ],
                const SizedBox(height: 12),
                // Call buttons row
                Row(
                  children: [
                    Expanded(
                      child: _SmallCallButton(
                        icon: Icons.emergency,
                        label: 'அவசரம்',
                        sublabel: 'Casualty',
                        phone: h.phoneCasualty,
                        color: AppColors.hospitalRed,
                        onTap: () => _call(h.phoneCasualty),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _SmallCallButton(
                        icon: Icons.airport_shuttle,
                        label: 'ஆம்புலன்ஸ்',
                        sublabel: 'Ambulance',
                        phone: h.phoneAmbulance,
                        color: Colors.red[700]!,
                        onTap: () => _call(h.phoneAmbulance),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Today / All week toggle
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _showingToday = true),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: _showingToday ? AppColors.hospitalRed : Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        Text(
                          '👨‍⚕️ இன்று',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: _showingToday ? Colors.white : AppColors.textPrimary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        Text(
                          "Today's Doctors",
                          style: TextStyle(
                            fontFamily: 'Roboto',
                            fontSize: 11,
                            color: _showingToday ? Colors.white70 : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _showingToday = false),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: !_showingToday ? AppColors.hospitalRed : Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        Text(
                          '📅 வாரம் முழுவதும்',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: !_showingToday ? Colors.white : AppColors.textPrimary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        Text(
                          'Full Week',
                          style: TextStyle(
                            fontFamily: 'Roboto',
                            fontSize: 11,
                            color: !_showingToday ? Colors.white70 : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Doctor list
        ...(_showingToday ? _buildTodayDoctors() : _buildAllDoctors()),
      ],
    );
  }

  List<Widget> _buildTodayDoctors() {
    if (_todayDoctors.isEmpty) {
      return [
        const SizedBox(height: 32),
        Center(
          child: Column(
            children: [
              Icon(Icons.person_off, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 12),
              const Text('இன்று டாக்டர் இல்லை', style: TextStyle(fontSize: 18)),
              const Text('No doctors available today', style: TextStyle(fontFamily: 'Roboto', fontSize: 12, color: AppColors.textSecondary)),
              const SizedBox(height: 4),
              const Text('நாளை வருகின்றனர்', style: TextStyle(fontSize: 16, color: AppColors.primary)),
            ],
          ),
        ),
      ];
    }
    return _todayDoctors.map((d) => _buildDoctorCard(d, highlightToday: true)).toList();
  }

  List<Widget> _buildAllDoctors() {
    if (_allDoctors.isEmpty) {
      return [
        const SizedBox(height: 32),
        const Center(child: Text('டாக்டர் தகவல் ஏற்றப்படுகின்றது...', style: TextStyle(fontSize: 16))),
      ];
    }
    return _allDoctors.map((d) => _buildDoctorCard(d, highlightToday: false)).toList();
  }

  Widget _buildDoctorCard(Doctor doctor, {required bool highlightToday}) {
    final todayDow = DateTime.now().weekday % 7;
    final availableToday = doctor.schedules.any((s) => s.dayOfWeek == todayDow);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: AppColors.hospitalRed.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(26),
                  ),
                  child: const Icon(Icons.person, color: AppColors.hospitalRed, size: 30),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(doctor.nameTamil, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      Text(doctor.nameEnglish, style: const TextStyle(fontFamily: 'Roboto', fontSize: 13, color: AppColors.textSecondary)),
                      if (doctor.specialisation != null)
                        Text(doctor.specialisation!, style: const TextStyle(fontSize: 14, color: AppColors.primary)),
                    ],
                  ),
                ),
                if (availableToday)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green[100],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text('✅ இன்று', style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.w500)),
                  ),
              ],
            ),
            if (doctor.schedules.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 8),
              ...doctor.schedules.map((s) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 3),
                child: Row(
                  children: [
                    Text(
                      _daysTamil[s.dayOfWeek],
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: s.dayOfWeek == todayDow ? AppColors.hospitalRed : AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _daysEnglish[s.dayOfWeek],
                      style: const TextStyle(fontFamily: 'Roboto', fontSize: 11, color: AppColors.textSecondary),
                    ),
                    const SizedBox(width: 16),
                    Text(
                      s.notesTamil ?? (s.startTime != null ? '${s.startTime} – ${s.endTime}' : 'காலை முதல் மாலை வரை'),
                      style: const TextStyle(fontSize: 14),
                    ),
                  ],
                ),
              )),
            ],
          ],
        ),
      ),
    );
  }
}

class _SmallCallButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final String sublabel;
  final String? phone;
  final Color color;
  final VoidCallback onTap;

  const _SmallCallButton({
    required this.icon,
    required this.label,
    required this.sublabel,
    required this.phone,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 6),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: color)),
                  Text(sublabel, style: const TextStyle(fontFamily: 'Roboto', fontSize: 10, color: AppColors.textSecondary)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
