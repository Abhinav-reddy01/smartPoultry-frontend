const rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').trim();
export const API_BASE_URL = rawBaseUrl.endsWith('/')
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

export function getToken() {
  return localStorage.getItem('poultry_token');
}

export function setToken(token) {
  localStorage.setItem('poultry_token', token);
}

export function clearAuth() {
  localStorage.removeItem('poultry_token');
  localStorage.removeItem('poultry_user');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}

export const api = {
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  customers: {
    list: () => request('/customers'),

    create: (payload) =>
      request('/customers', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    update: (id, payload) =>
      request(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    remove: (id) =>
      request(`/customers/${id}`, {
        method: 'DELETE',
      }),
  },

  sales: {
    list: () => request('/sales'),

    create: (payload) =>
      request('/sales', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    update: (id, payload) =>
      request(`/sales/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    remove: (id) =>
      request(`/sales/${id}`, {
        method: 'DELETE',
      }),
  },

  income: {
    list: () => request('/income'),

    create: (payload) =>
      request('/income', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    remove: (id) =>
      request(`/income/${id}`, {
        method: 'DELETE',
      }),
  },

  expenses: {
    list: () => request('/expenses'),

    create: (payload) =>
      request('/expenses', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    remove: (id) =>
      request(`/expenses/${id}`, {
        method: 'DELETE',
      }),
  },

  tax: {
    list: () => request('/tax'),

    update: (id, payload) =>
      request(`/tax/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  },

  payments: {
    list: () => request('/payments'),

    create: (payload) =>
      request('/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

    stock: {
    list: () => request('/stock'),

    summary: () => request('/stock/summary'),

    create: (payload) =>
      request('/stock', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  dashboard: () => request('/dashboard/summary'),

  reports: {
    daily: (date) =>
      request(`/reports/daily?date=${encodeURIComponent(date)}`),

    monthly: (month) =>
      request(`/reports/monthly?month=${encodeURIComponent(month)}`),
  },
};