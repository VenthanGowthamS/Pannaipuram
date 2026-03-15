import 'package:flutter/material.dart';

// ─── Water ───────────────────────────────────────────────────────────────────

class Street {
  final int id;
  final String nameTamil;
  final String? nameEnglish;

  const Street({required this.id, required this.nameTamil, this.nameEnglish});

  factory Street.fromJson(Map<String, dynamic> j) => Street(
        id: j['id'],
        nameTamil: j['name_tamil'],
        nameEnglish: j['name_english'],
      );
}

class WaterSchedule {
  final int streetId;
  final String streetNameTamil;
  final int frequencyDays;
  final String supplyTime; // "06:00:00"
  final String? nextSupplyDate;

  const WaterSchedule({
    required this.streetId,
    required this.streetNameTamil,
    required this.frequencyDays,
    required this.supplyTime,
    this.nextSupplyDate,
  });

  factory WaterSchedule.fromJson(Map<String, dynamic> j) => WaterSchedule(
        streetId: j['street_id'],
        streetNameTamil: j['street_name_tamil'] ?? j['name_tamil'] ?? '',
        frequencyDays: j['frequency_days'],
        supplyTime: j['supply_time'],
        nextSupplyDate: j['next_supply_date'],
      );
}

class WaterAlert {
  final int id;
  final String streetNameTamil;
  final DateTime reportedAt;
  final int confirmations;

  const WaterAlert({
    required this.id,
    required this.streetNameTamil,
    required this.reportedAt,
    required this.confirmations,
  });

  factory WaterAlert.fromJson(Map<String, dynamic> j) => WaterAlert(
        id: j['id'],
        streetNameTamil: j['street_name_tamil'] ?? j['name_tamil'] ?? '',
        reportedAt: DateTime.parse(j['reported_at']),
        confirmations: j['confirmations'] ?? 0,
      );
}

// ─── Power ───────────────────────────────────────────────────────────────────

class PowerCut {
  final int id;
  final String areaDescription;
  final String cutType; // 'planned' | 'unplanned'
  final DateTime startTime;
  final DateTime? endTime;
  final String? reasonTamil;
  final bool isResolved;

  const PowerCut({
    required this.id,
    required this.areaDescription,
    required this.cutType,
    required this.startTime,
    this.endTime,
    this.reasonTamil,
    required this.isResolved,
  });

  bool get isPlanned => cutType == 'planned';

  factory PowerCut.fromJson(Map<String, dynamic> j) => PowerCut(
        id: j['id'],
        areaDescription: j['area_description'] ?? '',
        cutType: j['cut_type'] ?? 'planned',
        startTime: DateTime.parse(j['start_time']),
        endTime: j['end_time'] != null ? DateTime.parse(j['end_time']) : null,
        reasonTamil: j['reason_tamil'],
        isResolved: j['is_resolved'] ?? false,
      );
}

// ─── Bus ─────────────────────────────────────────────────────────────────────

class BusCorridor {
  final int id;
  final String nameTamil;
  final String nameEnglish;
  final String colorHex;

  const BusCorridor({
    required this.id,
    required this.nameTamil,
    required this.nameEnglish,
    required this.colorHex,
  });

  factory BusCorridor.fromJson(Map<String, dynamic> j) => BusCorridor(
        id: j['id'],
        nameTamil: j['name_tamil'],
        nameEnglish: j['name_english'] ?? '',
        colorHex: j['color_hex'] ?? '#2196F3',
      );

  Color get color {
    final hex = colorHex.replaceAll('#', '');
    return Color(int.parse('FF$hex', radix: 16));
  }
}

class BusTiming {
  final int id;
  final String departsAt; // "07:45:00"
  final String daysOfWeek;
  final String busType; // 'ordinary' | 'express' | 'SETC'
  final bool isLastBus;
  final String? originTamil;
  final String? destTamil;

  const BusTiming({
    required this.id,
    required this.departsAt,
    required this.daysOfWeek,
    required this.busType,
    required this.isLastBus,
    this.originTamil,
    this.destTamil,
  });

  factory BusTiming.fromJson(Map<String, dynamic> j) => BusTiming(
        id: j['id'],
        departsAt: j['departs_at'],
        daysOfWeek: j['days_of_week'] ?? 'daily',
        busType: j['bus_type'] ?? 'ordinary',
        isLastBus: j['is_last_bus'] ?? false,
        originTamil: j['origin_tamil'],
        destTamil: j['dest_tamil'],
      );

  /// Returns time label like "7:45 காலை"
  String get displayTime {
    final parts = departsAt.split(':');
    int hour = int.parse(parts[0]);
    int minute = int.parse(parts[1]);
    final period = hour < 12 ? 'காலை' : hour < 17 ? 'பகல்' : hour < 20 ? 'மாலை' : 'இரவு';
    final displayHour = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
    final minuteStr = minute.toString().padLeft(2, '0');
    return '$displayHour:$minuteStr $period';
  }

  /// Minutes from now until this bus departs (negative if already passed)
  int minutesFromNow() {
    final now = DateTime.now();
    final parts = departsAt.split(':');
    final busTime = DateTime(
      now.year, now.month, now.day,
      int.parse(parts[0]),
      int.parse(parts[1]),
    );
    return busTime.difference(now).inMinutes;
  }
}

class NextBus {
  final int corridorId;
  final String corridorNameTamil;
  final String? departsAt;
  final int? minutesUntil;

  const NextBus({
    required this.corridorId,
    required this.corridorNameTamil,
    this.departsAt,
    this.minutesUntil,
  });

  factory NextBus.fromJson(Map<String, dynamic> j) => NextBus(
        corridorId: j['corridor_id'],
        corridorNameTamil: j['corridor_name_tamil'] ?? '',
        departsAt: j['departs_at'],
        minutesUntil: j['minutes_until'],
      );
}

// ─── Hospital ─────────────────────────────────────────────────────────────────

class Hospital {
  final int id;
  final String nameTamil;
  final String nameEnglish;
  final String? addressTamil;
  final String? phoneCasualty;
  final String? phoneAmbulance;
  final String? phoneGeneral;
  final String? pharmacyHours;

  const Hospital({
    required this.id,
    required this.nameTamil,
    required this.nameEnglish,
    this.addressTamil,
    this.phoneCasualty,
    this.phoneAmbulance,
    this.phoneGeneral,
    this.pharmacyHours,
  });

  factory Hospital.fromJson(Map<String, dynamic> j) => Hospital(
        id: j['id'],
        nameTamil: j['name_tamil'],
        nameEnglish: j['name_english'] ?? '',
        addressTamil: j['address_tamil'],
        phoneCasualty: j['phone_casualty'],
        phoneAmbulance: j['phone_ambulance'],
        phoneGeneral: j['phone_general'],
        pharmacyHours: j['pharmacy_hours'],
      );
}

class Doctor {
  final int id;
  final int? hospitalId;
  final String nameTamil;
  final String nameEnglish;
  final String? specialisation;
  final List<DoctorSchedule> schedules;

  const Doctor({
    required this.id,
    this.hospitalId,
    required this.nameTamil,
    required this.nameEnglish,
    this.specialisation,
    required this.schedules,
  });

  factory Doctor.fromJson(Map<String, dynamic> j) => Doctor(
        id: j['id'],
        hospitalId: j['hospital_id'],
        nameTamil: j['name_tamil'],
        nameEnglish: j['name_english'] ?? '',
        specialisation: j['specialisation'],
        schedules: (j['schedules'] as List? ?? [])
            .map((s) => DoctorSchedule.fromJson(s))
            .toList(),
      );
}

class DoctorSchedule {
  final int dayOfWeek; // 0=Sun ... 6=Sat
  final String? startTime;
  final String? endTime;
  final String? notesTamil;

  const DoctorSchedule({
    required this.dayOfWeek,
    this.startTime,
    this.endTime,
    this.notesTamil,
  });

  static const _daysTamil = [
    'ஞாயிறு', 'திங்கள்', 'செவ்வாய்',
    'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி',
  ];

  String get dayNameTamil => _daysTamil[dayOfWeek];

  factory DoctorSchedule.fromJson(Map<String, dynamic> j) => DoctorSchedule(
        dayOfWeek: j['day_of_week'],
        startTime: j['start_time'],
        endTime: j['end_time'],
        notesTamil: j['notes_tamil'],
      );
}

// ─── Auto / Van Drivers ───────────────────────────────────────────────────────

class AutoDriver {
  final int id;
  final String nameTamil;
  final String? nameEnglish;
  final String phone;
  final String vehicleType; // 'auto', 'van', 'car'
  final String? coverageTamil;
  final String? coverageEnglish;
  final String? scheduleTamil;

  const AutoDriver({
    required this.id,
    required this.nameTamil,
    this.nameEnglish,
    required this.phone,
    required this.vehicleType,
    this.coverageTamil,
    this.coverageEnglish,
    this.scheduleTamil,
  });

  factory AutoDriver.fromJson(Map<String, dynamic> j) => AutoDriver(
        id: j['id'],
        nameTamil: j['name_tamil'],
        nameEnglish: j['name_english'],
        phone: j['phone'],
        vehicleType: j['vehicle_type'] ?? 'auto',
        coverageTamil: j['coverage_tamil'],
        coverageEnglish: j['coverage_english'],
        scheduleTamil: j['schedule_tamil'],
      );
}

// ─── Emergency ────────────────────────────────────────────────────────────────

class EmergencyContact {
  final int id;
  final String category; // 'power','medical','police','panchayat','fire','other'
  final String nameTamil;
  final String nameEnglish;
  final String phone;
  final bool isVerified;
  final int displayOrder;

  const EmergencyContact({
    required this.id,
    required this.category,
    required this.nameTamil,
    required this.nameEnglish,
    required this.phone,
    required this.isVerified,
    required this.displayOrder,
  });

  factory EmergencyContact.fromJson(Map<String, dynamic> j) => EmergencyContact(
        id: j['id'],
        category: j['category'],
        nameTamil: j['name_tamil'],
        nameEnglish: j['name_english'] ?? '',
        phone: j['phone'],
        isVerified: j['is_verified'] ?? false,
        displayOrder: j['display_order'] ?? 0,
      );
}
