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
        throw new Error(data.error || 'API Error');
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

  // Power
  getPowerCuts() {
    return this.request('GET', '/api/power/cuts');
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

  addBusTiming(data) {
    return this.request('POST', '/admin/bus/timings', data);
  }

  deleteBusTiming(id) {
    return this.request('DELETE', `/admin/bus/timings/${id}`);
  }

  // Hospital
  getDoctors() {
    return this.request('GET', '/api/hospital/doctors');
  }

  addDoctor(data) {
    return this.request('POST', '/admin/hospital/doctors', data);
  }

  addDoctorSchedule(doctorId, data) {
    return this.request('POST', `/admin/hospital/doctors/${doctorId}/schedule`, data);
  }

  updateDoctor(id, data) {
    return this.request('PUT', `/admin/hospital/doctors/${id}`, data);
  }

  deleteDoctor(id) {
    return this.request('DELETE', `/admin/hospital/doctors/${id}`);
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

  // Streets
  getStreets() {
    return this.request('GET', '/admin/streets');
  }

  addStreet(data) {
    return this.request('POST', '/admin/streets', data);
  }
}

export default new ApiService();
