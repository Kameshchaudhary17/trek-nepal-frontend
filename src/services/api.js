const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
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

export default authService;
