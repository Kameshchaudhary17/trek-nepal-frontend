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

  upsertMyProfile(profileData, token) {
    return request('/guides/me/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
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
};

export { guideService, adminService };
export default authService;
