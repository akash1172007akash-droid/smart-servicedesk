import axios from 'axios';
import { mockStore, MOCK_USERS, MOCK_CATEGORIES } from './mockStore';

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.hash !== '#/login') {
          window.location.href = '#/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper to get current mock user from storage
const getCurrentUser = () => {
  const saved = localStorage.getItem('user');
  return saved ? JSON.parse(saved) : MOCK_USERS[0];
};

// -------------------------------------------------------------
// Auth APIs (with seamless GitHub Pages fallback)
// -------------------------------------------------------------
export const authApi = {
  login: async (credentials) => {
    if (!isGitHubPages) {
      try {
        return await api.post('/auth/login', credentials);
      } catch (err) {
        // If local backend is down or unreached, fallback
        if (err.response && err.response.status !== 404 && err.response.status !== 502) {
          throw err;
        }
      }
    }
    // GitHub Pages / Mock Fallback
    const email = credentials.email.trim().toLowerCase();
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.response = { data: { message: 'Invalid email or password' }, status: 401 };
      throw err;
    }
    const token = `mock-jwt-token-for-${user.role.toLowerCase()}-${user.id}`;
    return {
      data: {
        success: true,
        message: 'Login successful (Demo Mode)',
        data: { token, user, type: 'Bearer' },
      },
    };
  },

  register: async (userData) => {
    if (!isGitHubPages) {
      try {
        return await api.post('/auth/register', userData);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const newUser = {
      id: MOCK_USERS.length + 1,
      fullName: userData.fullName,
      email: userData.email,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    MOCK_USERS.push(newUser);
    const token = `mock-jwt-token-for-employee-${newUser.id}`;
    return {
      data: {
        success: true,
        message: 'User registered successfully (Demo Mode)',
        data: { token, user: newUser, type: 'Bearer' },
      },
    };
  },

  getCurrentUser: async () => {
    if (!isGitHubPages) {
      try {
        return await api.get('/auth/me');
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    return {
      data: {
        success: true,
        message: 'Current user profile',
        data: getCurrentUser(),
      },
    };
  },
};

// -------------------------------------------------------------
// Ticket APIs
// -------------------------------------------------------------
export const ticketApi = {
  getTickets: async (params) => {
    if (!isGitHubPages) {
      try {
        return await api.get('/tickets', { params });
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    return { data: { success: true, data: mockStore.getTickets(params) } };
  },

  getTicketById: async (id) => {
    if (!isGitHubPages) {
      try {
        return await api.get(`/tickets/${id}`);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const ticketDetail = mockStore.getTicketById(id);
    return { data: { success: true, data: ticketDetail } };
  },

  getTicketByNumber: async (ticketNumber) => {
    if (!isGitHubPages) {
      try {
        return await api.get(`/tickets/number/${ticketNumber}`);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const t = mockStore.tickets.find((x) => x.ticketNumber === ticketNumber);
    return { data: { success: true, data: mockStore.getTicketById(t?.id) } };
  },

  createTicketJson: async (ticketData) => {
    if (!isGitHubPages) {
      try {
        return await api.post('/tickets', ticketData);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const created = mockStore.createTicket(ticketData, getCurrentUser());
    return { data: { success: true, data: created } };
  },

  createTicketMultipart: async (formData) => {
    if (!isGitHubPages) {
      try {
        return await api.post('/tickets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const title = formData.get('title');
    const description = formData.get('description');
    const categoryId = formData.get('categoryId');
    const priority = formData.get('priority');
    const created = mockStore.createTicket({ title, description, categoryId, priority }, getCurrentUser());
    return { data: { success: true, data: created } };
  },

  updateStatus: async (id, data) => {
    if (!isGitHubPages) {
      try {
        return await api.patch(`/tickets/${id}/status`, data);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const updated = mockStore.updateStatus(id, data.status, data.resolutionNotes, getCurrentUser());
    return { data: { success: true, data: updated } };
  },

  updatePriority: async (id, data) => {
    if (!isGitHubPages) {
      try {
        return await api.patch(`/tickets/${id}/priority`, data);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const updated = mockStore.updatePriority(id, data.priority, getCurrentUser());
    return { data: { success: true, data: updated } };
  },

  assignTicket: async (id, data) => {
    if (!isGitHubPages) {
      try {
        return await api.patch(`/tickets/${id}/assign`, data);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const updated = mockStore.assignTicket(id, data.assignedToId, getCurrentUser());
    return { data: { success: true, data: updated } };
  },

  deleteTicket: async (id) => {
    if (!isGitHubPages) {
      try {
        return await api.delete(`/tickets/${id}`);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    mockStore.tickets = mockStore.tickets.filter((t) => t.id != id);
    mockStore.save();
    return { data: { success: true, message: 'Deleted' } };
  },
};

// -------------------------------------------------------------
// Comment APIs
// -------------------------------------------------------------
export const commentApi = {
  getComments: async (ticketId) => {
    if (!isGitHubPages) {
      try {
        return await api.get(`/tickets/${ticketId}/comments`);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const detail = mockStore.getTicketById(ticketId);
    return { data: { success: true, data: detail?.comments || [] } };
  },

  addComment: async (ticketId, data) => {
    if (!isGitHubPages) {
      try {
        return await api.post(`/tickets/${ticketId}/comments`, data);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const comment = mockStore.addComment(ticketId, data.commentText, getCurrentUser());
    return { data: { success: true, data: comment } };
  },
};

// -------------------------------------------------------------
// Attachment APIs
// -------------------------------------------------------------
export const attachmentApi = {
  uploadAttachment: async (ticketId, formData) => {
    if (!isGitHubPages) {
      try {
        return await api.post(`/tickets/${ticketId}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const file = formData.get('file');
    const att = {
      id: Date.now(),
      ticketId,
      filename: file?.name || 'attachment',
      originalFilename: file?.name || 'attachment',
      fileSize: file?.size || 1024,
      uploadedBy: getCurrentUser(),
      uploadedAt: new Date().toISOString(),
      downloadUrl: '#',
    };
    return { data: { success: true, data: att } };
  },

  getAttachments: async (ticketId) => {
    if (!isGitHubPages) {
      try {
        return await api.get(`/tickets/${ticketId}/attachments`);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const detail = mockStore.getTicketById(ticketId);
    return { data: { success: true, data: detail?.attachments || [] } };
  },

  getDownloadUrl: (ticketId, attachmentId) =>
    `${import.meta.env.VITE_API_URL || '/api'}/tickets/${ticketId}/attachments/${attachmentId}/download`,
};

// -------------------------------------------------------------
// History APIs
// -------------------------------------------------------------
export const historyApi = {
  getHistory: async (ticketId) => {
    if (!isGitHubPages) {
      try {
        return await api.get(`/tickets/${ticketId}/history`);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const detail = mockStore.getTicketById(ticketId);
    return { data: { success: true, data: detail?.history || [] } };
  },
};

// -------------------------------------------------------------
// Category APIs
// -------------------------------------------------------------
export const categoryApi = {
  getCategories: async (all = false) => {
    if (!isGitHubPages) {
      try {
        return await api.get('/categories', { params: { all } });
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const list = all ? mockStore.categories : mockStore.categories.filter((c) => c.isActive);
    return { data: { success: true, data: list } };
  },

  getCategoryById: async (id) => {
    if (!isGitHubPages) {
      try {
        return await api.get(`/categories/${id}`);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    return { data: { success: true, data: mockStore.categories.find((c) => c.id == id) } };
  },

  createCategory: async (data) => {
    if (!isGitHubPages) {
      try {
        return await api.post('/categories', data);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const newCat = {
      id: mockStore.categories.length + 1,
      name: data.name,
      description: data.description,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
    };
    mockStore.categories.push(newCat);
    return { data: { success: true, data: newCat } };
  },

  updateCategory: async (id, data) => {
    if (!isGitHubPages) {
      try {
        return await api.put(`/categories/${id}`, data);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const cat = mockStore.categories.find((c) => c.id == id);
    if (cat) {
      cat.name = data.name;
      cat.description = data.description;
      if (data.isActive !== undefined) cat.isActive = data.isActive;
    }
    return { data: { success: true, data: cat } };
  },
};

// -------------------------------------------------------------
// User APIs
// -------------------------------------------------------------
export const userApi = {
  getUsers: async () => {
    if (!isGitHubPages) {
      try {
        return await api.get('/users');
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    return { data: { success: true, data: mockStore.users } };
  },

  getUserById: async (id) => {
    if (!isGitHubPages) {
      try {
        return await api.get(`/users/${id}`);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    return { data: { success: true, data: mockStore.users.find((u) => u.id == id) } };
  },

  getAgents: async () => {
    if (!isGitHubPages) {
      try {
        return await api.get('/users/agents');
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const agents = mockStore.users.filter((u) => u.role === 'SUPPORT_AGENT' && u.status === 'ACTIVE');
    return { data: { success: true, data: agents } };
  },

  createUser: async (data) => {
    if (!isGitHubPages) {
      try {
        return await api.post('/users', data);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const newUser = {
      id: mockStore.users.length + 1,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    mockStore.users.push(newUser);
    return { data: { success: true, data: newUser } };
  },

  updateUser: async (id, data) => {
    if (!isGitHubPages) {
      try {
        return await api.put(`/users/${id}`, data);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const u = mockStore.users.find((x) => x.id == id);
    if (u) {
      u.fullName = data.fullName;
      u.role = data.role;
      u.status = data.status;
    }
    return { data: { success: true, data: u } };
  },

  toggleStatus: async (id) => {
    if (!isGitHubPages) {
      try {
        return await api.patch(`/users/${id}/status`);
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    const u = mockStore.users.find((x) => x.id == id);
    if (u) {
      u.status = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    }
    return { data: { success: true, data: u } };
  },
};

// -------------------------------------------------------------
// Dashboard APIs
// -------------------------------------------------------------
export const dashboardApi = {
  getAdminDashboard: async () => {
    if (!isGitHubPages) {
      try {
        return await api.get('/dashboard/admin');
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    return { data: { success: true, data: mockStore.getAdminDashboard() } };
  },

  getAgentDashboard: async () => {
    if (!isGitHubPages) {
      try {
        return await api.get('/dashboard/agent');
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    return { data: { success: true, data: mockStore.getAgentDashboard(getCurrentUser()) } };
  },

  getEmployeeDashboard: async () => {
    if (!isGitHubPages) {
      try {
        return await api.get('/dashboard/employee');
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }
    }
    return { data: { success: true, data: mockStore.getEmployeeDashboard(getCurrentUser()) } };
  },
};

export default api;
