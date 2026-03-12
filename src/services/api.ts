import axios from 'axios';

// ============================================
// API CONFIGURATION
// ============================================
// Backend routes are at /user, /admin, /superadmin (no /api prefix)
// In development: Use relative paths (proxied through vite or local API)
// In production: Use VITE_API_URL from .env
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Log the API endpoint for debugging
if (import.meta.env.DEV) {
  console.log('TrueChoice API Base URL:', API_BASE_URL || 'Using proxy at localhost');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('truechoice_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      timeout: config.timeout,
    });
  }

  return config;
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API] Response: ${response.status}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log detailed error information
    if (import.meta.env.DEV) {
      console.error(`[API] Error:`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('truechoice_token');
      localStorage.removeItem('truechoice_user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden. Check your permissions.');
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// Small helper to consistently unwrap the standard
// { success, message, data } response shape from the backend.
// If the backend ever returns a bare payload (no wrapper),
// this will gracefully fall back to that.
// We also preserve the top-level `message` field by merging it
// onto the returned payload when available.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapData<T = any>(response: any): T {
  const raw = response?.data ?? response;
  if (raw && typeof raw === 'object' && 'data' in raw && (raw as any).data !== undefined) {
    const inner = (raw as any).data ?? {};
    const message = (raw as any).message;
    if (message !== undefined && inner && typeof inner === 'object' && !('message' in inner)) {
      return { ...(inner as object), message } as T;
    }
    return inner as T;
  }
  return raw as T;
}

// ============================================
// AUTH API CALLS - Voter routes at /user
// ============================================
export const authAPI = {
  // POST /user/login
  login: async (email: string, password: string) => {
    const response = await api.post('/user/login', { email, password });
    return unwrapData(response);
  },

  // POST /user/register
  register: async (data: { email: string; password: string; fullName: string; srn: string }) => {
    const response = await api.post('/user/register', data);
    return unwrapData(response);
  },

  // GET /user/profile
  getCurrentUser: async () => {
    const response = await api.get('/user/profile');
    return unwrapData(response);
  },

  // PUT /user/profile/resetpassword
  resetPassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/user/profile/resetpassword', {
      currentPassword,
      newPassword,
    });
    return unwrapData(response);
  },

  // Logout (clear token locally - no backend endpoint needed)
  logout: async () => {
    localStorage.removeItem('truechoice_token');
    localStorage.removeItem('truechoice_user');
    return { success: true };
  },
};

// ============================================
// ELECTIONS API CALLS - Voter routes at /user
// ============================================
export const electionsAPI = {
  // GET /user/elections/active - Elections where voter is eligible
  getActive: async () => {
    const response = await api.get('/user/elections/active');
    return unwrapData(response);
  },

  // GET /user/elections/all - All public elections (scheduled, ongoing, closed with results)
  // This shows all elections regardless of eligibility - eligibility checked at vote time
  getAll: async () => {
    const response = await api.get('/user/elections/all');
    return unwrapData(response);
  },

  // GET /user/elections/:electionId/ballot
  getBallot: async (electionId: string) => {
    const response = await api.get(`/user/elections/${electionId}/ballot`);
    return unwrapData(response);
  },

  // GET /user/elections/:electionId/candidates - fallback if ballot doesn't include them
  getCandidates: async (electionId: string) => {
    const response = await api.get(`/user/elections/${electionId}/candidates`);
    return unwrapData(response);
  },

  // POST /user/elections/:electionId/vote
  castVote: async (electionId: string, candidateId: string) => {
    const response = await api.post(`/user/elections/${electionId}/vote`, {
      candidateId,
    });
    return unwrapData(response);
  },

  // GET /user/elections/:electionId/results
  getResults: async (electionId: string) => {
    const response = await api.get(`/user/elections/${electionId}/results`);
    return unwrapData(response);
  },
};

// ============================================
// ADMIN API CALLS - Admin routes at /admin
// ============================================
export const adminAPI = {
  // POST /admin/elections/create - Create election (always creates as draft, requires all fields)
  createElection: async (data: {
    title: string;
    positionName: string;
    description?: string;
    startTime: string;
    endTime: string;
  }) => {
    const response = await api.post('/admin/elections/create', data);
    return unwrapData(response);
  },

  // GET /admin/elections - Get all elections
  getElections: async () => {
    const response = await api.get('/admin/elections');
    return unwrapData(response);
  },

  // GET /admin/elections/:electionId - Get single election
  getElection: async (electionId: string) => {
    const response = await api.get(`/admin/elections/${encodeURIComponent(electionId)}`);
    return unwrapData(response);
  },

  // PUT /admin/elections/:electionId - Edit election (ONLY when status is 'draft')
  editElection: async (electionId: string, data: {
    title?: string;
    positionName?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    const response = await api.put(`/admin/elections/${encodeURIComponent(electionId)}`, data);
    return unwrapData(response);
  },

  // PUT /admin/elections/:electionId - Update election (for scheduling draft elections)
  updateElection: async (electionId: string, data: {
    startTime?: string;
    endTime?: string;
    status?: 'scheduled';
    title?: string;
    positionName?: string;
    description?: string;
  }) => {
    const response = await api.put(`/admin/elections/${electionId}`, data);
    return unwrapData(response);
  },

  // POST /admin/elections/:electionId/candidates/create - Add candidate
  addCandidate: async (data: {
    displayName: string;
    manifesto?: string;
    photoUrl?: string;
    electionId: string;
  }) => {
    const { electionId, displayName, manifesto, photoUrl } = data;
    const response = await api.post(`/admin/elections/${encodeURIComponent(electionId)}/candidates/create`, {
      displayName,
      manifesto,
      photoUrl,
    });
    return unwrapData(response);
  },

  // GET /admin/elections/:electionId/candidates - Get candidates
  getCandidates: async (electionId: string) => {
    const response = await api.get(`/admin/elections/${encodeURIComponent(electionId)}/candidates`);
    // Backend returns: { election: {...}, totalCandidates: number, candidate: [...] }
    return unwrapData(response);
  },

  // PATCH /admin/elections/:electionId/publish-results - Publish results
  publishResults: async (electionId: string) => {
    const response = await api.patch(`/admin/elections/${encodeURIComponent(electionId)}/publish-results`);
    return unwrapData(response);
  },
  // POST /admin/elections/:electionId/eligible/upload - Upload eligible voters (SRN file)
  uploadVoters: async (electionId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/elections/${encodeURIComponent(electionId)}/eligible/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapData(response);
  },

  // POST /admin/elections/:electionId/start - Force start election
  forceStartElection: async (electionId: string) => {
    const response = await api.post(`/admin/elections/${encodeURIComponent(electionId)}/start`, { forceStart: true });
    return unwrapData(response);
  },

  // POST /admin/elections/:electionId/close - Force close election
  forceCloseElection: async (electionId: string) => {
    const response = await api.post(`/admin/elections/${encodeURIComponent(electionId)}/close`, { forceClose: true });
    return unwrapData(response);
  },

  // DELETE /admin/candidates/:candidateId - Delete candidate
  deleteCandidate: async (candidateId: string) => {
    const response = await api.delete(`/admin/candidates/${candidateId}`);
    return unwrapData(response);
  },

  // DELETE /admin/elections/:electionId
  // NOTE: This route does not exist in the backend. Calling this will always reject.
  deleteElection: async (_electionId: string) => {
    return Promise.reject(new Error('Deleting elections is not supported by the backend.'));
  },

  // PATCH /admin/elections/:electionId/schedule - Promote draft → scheduled
  // NOTE: Backend ignores any body on this endpoint; it uses the already-stored startTime/endTime.
  scheduleElection: async (electionId: string) => {
    const response = await api.patch(`/admin/elections/${encodeURIComponent(electionId)}/schedule`);
    return unwrapData(response);
  },

  // GET /admin/elections/:electionId/results - Get election results (vote counts)
  getElectionResults: async (electionId: string) => {
    const response = await api.get(`/admin/elections/${encodeURIComponent(electionId)}/results`);
    return unwrapData(response);
  },
};

// ============================================
// SUPERADMIN API CALLS - Superadmin routes at /superadmin
// ============================================
export const superadminAPI = {
  // GET /superadmin/admin - Get current admin details
  getCurrentAdmin: async () => {
    const response = await api.get('/superadmin/admin');
    return unwrapData(response);
  },

  // GET all users (for selecting new admin) - using admin endpoint if available
  getUsers: async () => {
    const response = await api.get('/superadmin/users');
    return unwrapData(response);
  },

  // POST /superadmin/users/:userId/make-admin - Promote user to admin
  makeAdmin: async (userId: string) => {
    const response = await api.post(`/superadmin/users/${userId}/make-admin`);
    return unwrapData(response);
  },

  // POST /superadmin/users/:userId/make-superadmin - Transfer superadmin ownership
  makeSuperadmin: async (userId: string) => {
    const response = await api.post(`/superadmin/users/${userId}/make-superadmin`);
    return unwrapData(response);
  },
};

export default api;
