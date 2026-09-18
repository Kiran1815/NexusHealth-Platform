import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken: refresh });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          err.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(err.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

export const doctors = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  recommend: (data) => api.post('/doctors/recommend', data),
  getSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
};

export const appointments = {
  book: (data) => api.post('/appointments', data),
  getMy: () => api.get('/appointments/my'),
  cancel: (id) => api.delete(`/appointments/${id}`),
  update: (id, data) => api.patch(`/appointments/${id}`, data),
};

export const ai = {
  assess: (data) => api.post('/ai/aria/assess', data),
  echoCheckin: (data) => api.post('/ai/echo/checkin', data),
  getSentinelRisk: () => api.get('/ai/sentinel/risk'),
  getOutbreaks: () => api.get('/ai/pulse/outbreaks'),
  getPreventive: () => api.get('/ai/preventive'),
};

export const emergency = {
  sos: (data) => api.post('/emergency/sos', data),
  getNearbyHospitals: (lat, lng) => api.get('/emergency/hospitals', { params: { lat, lng } }),
  getBloodBanks: () => api.get('/emergency/blood-banks'),
  getFirstAid: (condition) => api.get(`/emergency/first-aid/${condition}`),
};

export const records = {
  getAll: () => api.get('/records'),
  add: (data) => api.post('/records', data),
  share: (data) => api.post('/records/share', data),
};

export const pharmacy = {
  getNearby: () => api.get('/pharmacy/nearby'),
  checkInteraction: (drugs) => api.post('/pharmacy/check-interaction', { drugs }),
  prescriptionOCR: (data) => api.post('/pharmacy/prescription-ocr', data),
};

export const analytics = {
  getImpact: () => api.get('/analytics/impact'),
  getDashboard: () => api.get('/analytics/dashboard'),
};

export const geo = {
  getFacilities: (lat, lng) => api.get('/geo/facilities', { params: { lat, lng } }),
};

export default api;
