/**
 * API base URL from env. Fallback for dev.
 */
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function url(path) {
  const base = API_BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

async function post(path, body) {
  const res = await fetch(url(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function get(path) {
  const res = await fetch(url(path));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  verifyUser: (fullName, phoneNumber) =>
    post('verify-user.php', { full_name: fullName, phone_number: phoneNumber }),

  calculateBid: (payload) => post('calculate-bid.php', payload),
  calculateTotal: (payload) => post('calculate-total.php', payload),
  calculateProfit: (payload) => post('calculate-profit.php', payload),

  historyList: (userPhone) => get(`history-list.php?user_phone=${encodeURIComponent(userPhone)}`),
  historySave: (userPhone, featureType, inputData, outputData) =>
    post('history-save.php', {
      user_phone: userPhone,
      feature_type: featureType,
      input_data: inputData,
      output_data: outputData,
    }),
  historyDelete: (userPhone, id = null) =>
    post('history-delete.php', { user_phone: userPhone, id }),
};

export function getUserPhone() {
  return window.localStorage.getItem('biztools_user_phone') || '';
}

export function setUserSession(phone) {
  window.localStorage.setItem('biztools_user_phone', phone);
  window.localStorage.setItem('biztools_last_verified_at', String(Date.now()));
}

export function isSessionValid() {
  const at = window.localStorage.getItem('biztools_last_verified_at');
  if (!at) return false;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - Number(at) < sevenDays;
}

export function clearSession() {
  window.localStorage.removeItem('biztools_user_phone');
  window.localStorage.removeItem('biztools_last_verified_at');
}

// ── Admin helpers ──

function adminUrl(path) {
  const token = getAdminToken();
  const u = url(path);
  const sep = u.includes('?') ? '&' : '?';
  return u + sep + 'admin_token=' + encodeURIComponent(token);
}

function adminGet(path) {
  return fetch(adminUrl(path), {
    headers: {
      'X-Admin-Token': 'Bearer ' + getAdminToken(),
    },
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  });
}

function adminPost(path, body) {
  return fetch(adminUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': 'Bearer ' + getAdminToken(),
    },
    body: JSON.stringify(body),
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  });
}

export const adminApi = {
  login: (username, password) =>
    post('admin-login.php', { username, password }),
  getUsers: () => adminGet('admin-users.php'),
  getUserDetail: (phone) =>
    adminGet(`admin-user-detail.php?phone=${encodeURIComponent(phone)}`),
  updateUser: (phone, fullName, newPhone) =>
    adminPost('admin-user-update.php', { phone, full_name: fullName, new_phone: newPhone }),
  deleteUser: (phone) =>
    adminPost('admin-user-delete.php', { phone }),
  updateHistory: (id, inputData, outputData) =>
    adminPost('admin-history-update.php', { id, input_data: inputData, output_data: outputData }),
  deleteHistory: (id) =>
    adminPost('admin-history-delete.php', { id }),
};

export function getAdminToken() {
  return window.localStorage.getItem('biztools_admin_token') || '';
}

export function setAdminToken(token) {
  window.localStorage.setItem('biztools_admin_token', token);
}

export function clearAdminToken() {
  window.localStorage.removeItem('biztools_admin_token');
}

export function isAdminLoggedIn() {
  return !!getAdminToken();
}

export function formatMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n));
}

export { url };
