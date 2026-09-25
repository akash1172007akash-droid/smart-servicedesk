import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// Auth APIs
// -------------------------------------------------------------
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// -------------------------------------------------------------
// Ticket APIs
// -------------------------------------------------------------
export const ticketApi = {
  getTickets: (params) => api.get('/tickets', { params }),
  getTicketById: (id) => api.get(`/tickets/${id}`),
  getTicketByNumber: (ticketNumber) => api.get(`/tickets/number/${ticketNumber}`),
  createTicketJson: (ticketData) => api.post('/tickets', ticketData),
  createTicketMultipart: (formData) =>
    api.post('/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStatus: (id, data) => api.patch(`/tickets/${id}/status`, data),
  updatePriority: (id, data) => api.patch(`/tickets/${id}/priority`, data),
  assignTicket: (id, data) => api.patch(`/tickets/${id}/assign`, data),
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
};

// -------------------------------------------------------------
// Comment APIs
// -------------------------------------------------------------
export const commentApi = {
  getComments: (ticketId) => api.get(`/tickets/${ticketId}/comments`),
  addComment: (ticketId, data) => api.post(`/tickets/${ticketId}/comments`, data),
};

// -------------------------------------------------------------
// Attachment APIs
// -------------------------------------------------------------
export const attachmentApi = {
  uploadAttachment: (ticketId, formData) =>
    api.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAttachments: (ticketId) => api.get(`/tickets/${ticketId}/attachments`),
  getDownloadUrl: (ticketId, attachmentId) => `/api/tickets/${ticketId}/attachments/${attachmentId}/download`,
};

// -------------------------------------------------------------
// History APIs
// -------------------------------------------------------------
export const historyApi = {
  getHistory: (ticketId) => api.get(`/tickets/${ticketId}/history`),
};

// -------------------------------------------------------------
// Category APIs
// -------------------------------------------------------------
export const categoryApi = {
  getCategories: (all = false) => api.get('/categories', { params: { all } }),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
};

// -------------------------------------------------------------
// User APIs
// -------------------------------------------------------------
export const userApi = {
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  getAgents: () => api.get('/users/agents'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  toggleStatus: (id) => api.patch(`/users/${id}/status`),
};

// -------------------------------------------------------------
// Dashboard APIs
// -------------------------------------------------------------
export const dashboardApi = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getAgentDashboard: () => api.get('/dashboard/agent'),
  getEmployeeDashboard: () => api.get('/dashboard/employee'),
};

export default api;
