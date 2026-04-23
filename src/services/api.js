const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    ...rest,
  });
  const data = await res.json();
  if (!res.ok) throw { response: { data } };
  return data;
}

const authService = {
  login(credentials) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register(form) {
    const { fullName, email, password, role, phone } = form;
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, role, phone }),
    });
  },

  verifyOtp(email, otp) {
    return request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  resendOtp(email) {
    return request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  getMe(token) {
    return request('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateMe(data) {
    return request('/users/me', {
      method: 'PATCH',
      headers: authHeader(),
      body: JSON.stringify(data),
    });
  },

  googleAuth(accessToken) {
    return request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    });
  },
};

const guideService = {
  getGuides(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null))
    ).toString();
    return request(`/guides${qs ? `?${qs}` : ''}`);
  },

  getGuideById(id) {
    return request(`/guides/${id}`);
  },

  getMyProfile() {
    return request('/guides/me', { headers: authHeader() });
  },

  upsertMyProfile(profileData) {
    return request('/guides/me/profile', {
      method: 'PUT',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
  },
};

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const adminService = {
  listGuides(status) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/guides/admin${qs}`, { headers: authHeader() });
  },

  setGuideStatus(id, status) {
    return request(`/guides/admin/${id}/status`, {
      method: 'PATCH',
      headers: authHeader(),
      body: JSON.stringify({ status }),
    });
  },

  listTrekkers(search = '') {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/users/admin/trekkers${qs}`, { headers: authHeader() });
  },
};

export const treksService = {
  getTreks(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null))
    ).toString();
    return request(`/treks${qs ? `?${qs}` : ''}`);
  },
  adminGetTreks() {
    return request('/treks/admin/all', { headers: authHeader() });
  },
  createTrek(data) {
    return request('/treks/admin', { method: 'POST', headers: authHeader(), body: JSON.stringify(data) });
  },
  updateTrek(id, data) {
    return request(`/treks/admin/${id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify(data) });
  },
  deleteTrek(id) {
    return request(`/treks/admin/${id}`, { method: 'DELETE', headers: authHeader() });
  },
};

export const pricingService = {
  getConfig() {
    return request('/pricing/config');
  },
  adminUpdateTrekPrice(trekId, data) {
    return request(`/pricing/treks/${encodeURIComponent(trekId)}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify(data),
    });
  },
  adminUpdateConfig(data) {
    return request('/pricing/config', {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify(data),
    });
  },
};

export const conditionsService = {
  getConditions(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null))
    ).toString();
    return request(`/conditions${qs ? `?${qs}` : ''}`);
  },
  getRegions() {
    return request('/conditions/regions');
  },
};

export const uploadService = {
  async upload(file, type) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/upload/${type}`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw { response: { data } };
    return data;
  },
};

export { guideService, adminService };
export default authService;
