import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexus_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const patientAPI = {
  getProfile: () => api.get('/patients/profile'),
  getVitals: () => api.get('/patients/vitals'),
  updateVitals: (data) => api.put('/patients/vitals', data),
  getMedications: () => api.get('/patients/medications'),
  addMedication: (data) => api.post('/patients/medications', data),
  getVaccinations: () => api.get('/patients/vaccinations'),
  getHealthScore: () => api.get('/patients/health-score'),
};

export const doctorAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
  getRecommendations: (data) => api.post('/doctors/recommend', data),
};

export const appointmentAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  book: (data) => api.post('/appointments', data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data),
  getQueue: (doctorId) => api.get(`/appointments/queue/${doctorId}`),
};

export const aiAPI = {
  ariaAssess: (data) => api.post('/ai/aria/assess', data),
  ariaFollowup: (data) => api.post('/ai/aria/followup', data),
  sentinelRisk: () => api.get('/ai/sentinel/risk'),
  echoCheckin: (data) => api.post('/ai/echo/checkin', data),
  pulseHeatmap: () => api.get('/ai/pulse/heatmap'),
  pulseSurge: () => api.get('/ai/pulse/surge'),
};

export const emergencyAPI = {
  sos: (data) => api.post('/emergency/sos', data),
  getActive: () => api.get('/emergency/active'),
  cancel: (id) => api.patch(`/emergency/${id}/cancel`),
  getNearbyHospitals: () => api.get('/emergency/hospitals'),
};

export const recordsAPI = {
  getAll: (params) => api.get('/records', { params }),
  create: (data) => api.post('/records', data),
  getTimeline: () => api.get('/records/timeline'),
  getShare: (id) => api.get(`/records/share/${id}`),
};

export const pharmacyAPI = {
  getNearby: () => api.get('/pharmacy/nearby'),
  checkAvailability: (data) => api.post('/pharmacy/check-availability', data),
  checkInteractions: (data) => api.post('/pharmacy/drug-interactions', data),
};

export const analyticsAPI = {
  getImpact: () => api.get('/analytics/impact'),
  getDashboard: () => api.get('/analytics/dashboard'),
};

export const geoAPI = {
  getFacilities: (params) => api.get('/geo/facilities', { params }),
};

export default api;
