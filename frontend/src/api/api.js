import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
  || (process.env.REACT_APP_API_HOST
    ? `https://${process.env.REACT_APP_API_HOST}/api`
    : 'http://localhost:8080/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const expenseAPI = {
  create: (data) => api.post('/expenses', data),
  getAll: () => api.get('/expenses'),
  getById: (id) => api.get(`/expenses/${id}`),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getByRange: (startDate, endDate) => api.get('/expenses/range', { params: { startDate, endDate } }),
};

export const budgetAPI = {
  create: (data) => api.post('/budgets', data),
  getAll: () => api.get('/budgets'),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

export const savingAPI = {
  create: (data) => api.post('/savings', data),
  getAll: () => api.get('/savings'),
  getTotal: () => api.get('/savings/total'),
  delete: (id) => api.delete(`/savings/${id}`),
};

export default api;