const TOKEN_KEY = 'memorymap_jwt_token';
const LEGACY_TOKEN_KEY = 'photoflow_jwt_token';

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
};

export const setToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }
};

export const removeToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.data = data;
    err.status = response.status;
    err.requiresVerification = Boolean(data?.requiresVerification);
    err.email = data?.email;
    err.devOtp = data?.devOtp;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    register: (payload) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    verifyOtp: (payload) => request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    resendOtp: (payload) => request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    login: (payload) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    getMe: () => request('/auth/me'),
    updateProfile: (payload) => request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  upload: {
    file: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request('/upload', {
        method: 'POST',
        body: formData
      });
    },
    multiple: async (files) => {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('files', f));
      return request('/upload/multiple', {
        method: 'POST',
        body: formData
      });
    }
  },

  journeys: {
    list: () => request('/journeys'),
    get: (id) => request(`/journeys/${id}`),
    create: (data) => request('/journeys', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/journeys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/journeys/${id}`, {
      method: 'DELETE'
    })
  },

  checkpoints: {
    list: (journeyId) => request(`/journeys/${journeyId}/checkpoints`),
    create: (journeyId, data) => request(`/journeys/${journeyId}/checkpoints`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (journeyId, checkpointId, data) => request(`/journeys/${journeyId}/checkpoints/${checkpointId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (journeyId, checkpointId) => request(`/journeys/${journeyId}/checkpoints/${checkpointId}`, {
      method: 'DELETE'
    })
  },

  notes: {
    list: (journeyId) => request(`/journeys/${journeyId}/notes`),
    create: (journeyId, data) => request(`/journeys/${journeyId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (journeyId, noteId, data) => request(`/journeys/${journeyId}/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (journeyId, noteId) => request(`/journeys/${journeyId}/notes/${noteId}`, {
      method: 'DELETE'
    })
  }
};
