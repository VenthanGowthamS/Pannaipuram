const API_BASE = '';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('panToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('panToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('panToken');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(method, endpoint, body = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'API Error');
      }

      return data.data || data;
    } catch (error) {
      throw error;
    }
  }

  // Auth
  login(email, password) {
    return this.request('POST', '/admin/auth/login', { email, password });
  }

  signup(data) {
    return this.request('POST', '/admin/auth/signup', data);
  }

  register(data) {
    return this.request('POST', '/admin/auth/register', data);
  }

  getUsers() {
    return this.request('GET', '/admin/auth/users');
  }

  updateUserRole(id, role) {
    return this.request('PUT', `/admin/auth/users/${id}/role`, { role });
  }

  toggleUserActive(id, isActive) {
    return this.request('PUT', `/admin/auth/users/${id}/active`, { is_active: isActive });
  }

  deleteUser(id) {
    return this.request('DELETE', `/admin/auth/users/${id}`);
  }

  // Announcements
  getAnnouncements() {
    return this.request('GET', '/admin/announcements');
  }

  addAnnouncement(data) {
    return this.request('POST', '/admin/announcements', data);
  }

  updateAnnouncement(id, data) {
    return this.request('PUT', `/admin/announcements/${id}`, data);
  }

  deleteAnnouncement(id) {
    return this.request('DELETE', `/admin/announcements/${id}`);
  }

  // Power
  getPowerCuts() {
    return this.request('GET', '/admin/power/cuts');
  }

  addPowerCut(data) {
    return this.request('POST', '/admin/power/cuts', data);
  }

  resolvePowerCut(id) {
    return this.request('PUT', `/admin/power/cuts/${id}`, { is_resolved: true });
  }

  deletePowerCut(id) {
    return this.request('DELETE', `/admin/power/cuts/${id}`);
  }

  // Bus
  getBusCorridors() {
    return this.request('GET', '/admin/bus/corridors');
  }

  getBusTimings(corridorId) {
    return this.request('GET', `/api/bus/timings/${corridorId}`);
  }

  addBusRoute(data) {
    return this.request('POST', '/admin/bus/routes', data);
  }

  async addBusTiming(data) {
    // First, create/find the route for this corridor
    const corridor = data.corridor_id;
    const routeData = await this.request('POST', '/admin/bus/routes', {
      corridor_id: parseInt(corridor),
      direction: 'outbound',
      origin_tamil: 'பண்ணைப்புரம்',
      dest_tamil: 'பண்ணைப்புரம்',
    });
    const routeId = routeData.id;
    if (!routeId) throw new Error('Failed to create bus route');

    // Then add the timing with the route_id
    return this.request('POST', '/admin/bus/timings', {
      route_id: routeId,
      departs_at: data.departs_at.includes(':') && data.departs_at.split(':').length === 2 ? data.departs_at + ':00' : data.departs_at,
      days_of_week: data.days_of_week || 'daily',
      bus_type: data.bus_type || 'ordinary',
      operator_name: data.operator_name || null,
      is_last_bus: data.is_last_bus || false,
    });
  }

  updateBusTiming(id, data) {
    return this.request('PUT', `/admin/bus/timings/${id}`, data);
  }

  deleteBusTiming(id) {
    return this.request('DELETE', `/admin/bus/timings/${id}`);
  }

  // Hospital CRUD
  getHospitals() {
    return this.request('GET', '/admin/hospital/list');
  }

  addHospital(data) {
    return this.request('POST', '/admin/hospital', data);
  }

  updateHospital(id, data) {
    return this.request('PUT', `/admin/hospital/${id}`, data);
  }

  deleteHospital(id) {
    return this.request('DELETE', `/admin/hospital/${id}`);
  }

  // Doctor CRUD
  getDoctors() {
    return this.request('GET', '/api/hospital/doctors');
  }

  addDoctor(data) {
    return this.request('POST', '/admin/hospital/doctors', data);
  }

  updateDoctor(id, data) {
    return this.request('PUT', `/admin/hospital/doctors/${id}`, data);
  }

  deleteDoctor(id) {
    return this.request('DELETE', `/admin/hospital/doctors/${id}`);
  }

  // Doctor Schedule
  replaceDoctorSchedule(doctorId, schedules) {
    return this.request('PUT', `/admin/hospital/doctors/${doctorId}/schedule`, { schedules });
  }

  clearDoctorSchedule(doctorId) {
    return this.request('DELETE', `/admin/hospital/doctors/${doctorId}/schedule`);
  }

  // Emergency
  getEmergencyContacts() {
    return this.request('GET', '/api/emergency/contacts');
  }

  addEmergencyContact(data) {
    return this.request('POST', '/admin/contacts', data);
  }

  updateEmergencyContact(id, data) {
    return this.request('PUT', `/admin/contacts/${id}`, data);
  }

  deleteEmergencyContact(id) {
    return this.request('DELETE', `/admin/contacts/${id}`);
  }

  // Auto
  getAutoContact() {
    return this.request('GET', '/admin/auto/contact');
  }

  updateAutoContact(data) {
    return this.request('PUT', '/admin/auto/contact', data);
  }

  getWhatsAppConfig() {
    return this.request('GET', '/admin/auto/whatsapp-config');
  }

  updateWhatsAppConfig(data) {
    return this.request('PUT', '/admin/auto/whatsapp-config', data);
  }

  getAutoDrivers() {
    return this.request('GET', '/admin/auto/drivers');
  }

  addAutoDriver(data) {
    return this.request('POST', '/admin/auto/drivers', data);
  }

  updateAutoDriver(id, data) {
    return this.request('PUT', `/admin/auto/drivers/${id}`, data);
  }

  deleteAutoDriver(id) {
    return this.request('DELETE', `/admin/auto/drivers/${id}`);
  }

  // Water
  getWaterSchedules() {
    return this.request('GET', '/admin/water/streets');
  }

  updateWaterSchedule(streetId, data) {
    return this.request('PUT', `/admin/water/schedule/${streetId}`, data);
  }

  deleteWaterSchedule(streetId) {
    return this.request('DELETE', `/admin/water/schedule/${streetId}`);
  }

  // Streets
  getStreets() {
    return this.request('GET', '/admin/water/streets');
  }

  addStreet(data) {
    return this.request('POST', '/admin/streets', data);
  }

  updateStreet(id, data) {
    return this.request('PUT', `/admin/streets/${id}`, data);
  }

  deleteStreet(id) {
    return this.request('DELETE', `/admin/streets/${id}`);
  }

  // Local Services
  getLocalServices() {
    return this.request('GET', '/admin/services');
  }

  addLocalService(data) {
    return this.request('POST', '/admin/services', data);
  }

  updateLocalService(id, data) {
    return this.request('PUT', `/admin/services/${id}`, data);
  }

  deleteLocalService(id) {
    return this.request('DELETE', `/admin/services/${id}`);
  }

  // Feedback
  getFeedback() {
    return this.request('GET', '/admin/feedback');
  }

  markFeedbackRead(id) {
    return this.request('PUT', `/admin/feedback/${id}/read`);
  }

  deleteFeedback(id) {
    return this.request('DELETE', `/admin/feedback/${id}`);
  }
}

export default new ApiService();
