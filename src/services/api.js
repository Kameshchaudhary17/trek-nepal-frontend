const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message || 'API request failed');
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    // Legacy shape — existing callers read `err.response?.data?.message`.
    this.response = { data };
  }
}

async function request(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      ...rest,
    });
  } catch (err) {
    // Network failure / CORS / DNS — fetch rejects without a Response.
    throw new ApiError('Network error — please check your connection.', {
      status: 0,
      data: { message: 'Network error — please check your connection.' },
    });
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response (e.g. 204, HTML error page) */
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new ApiError(message, { status: res.status, data: data || { message } });
  }
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

  forgotPassword(email) {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(email, otp, newPassword) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  },

  async logout() {
    // Best-effort server-side revoke; always clear local state.
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await request('/auth/logout', { method: 'POST', headers: authHeader() });
      } catch {
        /* ignore — client-side clear below is what matters for this device */
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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

  getMyReviews() {
    return request('/guides/me/reviews', { headers: authHeader() });
  },

  getMyEarnings() {
    return request('/guides/me/earnings', { headers: authHeader() });
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

  getStats() {
    return request('/users/admin/stats', { headers: authHeader() });
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

export const reviewService = {
  forGuide(guideId, params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null))
    ).toString();
    return request(`/guides/${guideId}/reviews${qs ? `?${qs}` : ''}`);
  },
  forBooking(bookingId) {
    return request(`/bookings/${bookingId}/review`, { headers: authHeader() });
  },
  submit(bookingId, { rating, comment }) {
    return request(`/bookings/${bookingId}/review`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ rating, comment }),
    });
  },
};

export const paymentService = {
  createIntent(bookingId) {
    return request(`/payments/intent/${bookingId}`, {
      method: 'POST',
      headers: authHeader(),
    });
  },
};

export const messageService = {
  list(bookingId, afterIso) {
    const qs = afterIso ? `?after=${encodeURIComponent(afterIso)}` : '';
    return request(`/bookings/${bookingId}/messages${qs}`, { headers: authHeader() });
  },
  send(bookingId, text) {
    return request(`/bookings/${bookingId}/messages`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ text }),
    });
  },
  unreadCount() {
    return request('/messages/unread', { headers: authHeader() });
  },
};

export const bookingService = {
  create(data) {
    return request('/bookings', {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(data),
    });
  },

  getMyBookings() {
    return request('/bookings/my', { headers: authHeader() });
  },

  getGuideBookings(status) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/bookings/guide${qs}`, { headers: authHeader() });
  },

  updateStatus(id, status, guideNote) {
    return request(`/bookings/${id}/status`, {
      method: 'PATCH',
      headers: authHeader(),
      body: JSON.stringify({ status, guideNote }),
    });
  },

  getById(id) {
    return request(`/bookings/${id}`, { headers: authHeader() });
  },
};

export { guideService, adminService };
export default authService;
