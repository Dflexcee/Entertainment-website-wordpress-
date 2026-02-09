import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi, clearAdminToken, isAdminLoggedIn, formatMoney } from '../api';
import { useTheme } from '../ThemeContext';
import './Admin.css';

function formatDate(s) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return s; }
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/admin', { replace: true });
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getUsers();
      setUsers(res.users || []);
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        clearAdminToken();
        navigate('/admin', { replace: true });
        return;
      }
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (phone, name) => {
    if (!window.confirm(`Delete user "${name}" (${phone}) and ALL their history? This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(phone);
      setUsers((prev) => prev.filter((u) => u.phone_number !== phone));
    } catch (err) {
      setError(err.message || 'Failed to delete.');
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin', { replace: true });
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.full_name.toLowerCase().includes(q) || u.phone_number.includes(q);
  });

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <Link to="/" className="admin-home-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            App
          </Link>
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <button className="layout-theme-toggle" onClick={toggle} title={dark ? 'Light' : 'Dark'}>
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-num">{users.length}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">{users.reduce((s, u) => s + Number(u.calculation_count || 0), 0)}</span>
            <span className="admin-stat-label">Total Calculations</span>
          </div>
        </div>

        <div className="admin-search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <p className="admin-error">{error}</p>}

        {loading ? (
          <p className="admin-loading">Loading users...</p>
        ) : filtered.length === 0 ? (
          <p className="admin-empty">{search ? 'No users match your search.' : 'No users found.'}</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Calculations</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="admin-td-name">{u.full_name}</td>
                    <td>{u.phone_number}</td>
                    <td>{u.calculation_count}</td>
                    <td>{formatDate(u.created_at)}</td>
                    <td className="admin-td-actions">
                      <Link to={`/admin/user/${u.phone_number}`} className="admin-btn-view">View</Link>
                      <button className="admin-btn-delete" onClick={() => handleDeleteUser(u.phone_number, u.full_name)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
