import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi, clearAdminToken, isAdminLoggedIn, formatMoney } from '../api';
import { useTheme } from '../ThemeContext';
import './Admin.css';

const FEATURE_LABELS = {
  budget_to_bid: 'Budget → Bid',
  bid_to_total: 'Bid → Total',
  profit: 'Selling Price & Profit',
};

function formatDate(s) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return s; }
}

export default function AdminUserDetail() {
  const { phone } = useParams();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit user state
  const [editingUser, setEditingUser] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit history state
  const [editHistoryId, setEditHistoryId] = useState(null);
  const [editHistoryJson, setEditHistoryJson] = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/admin', { replace: true });
      return;
    }
    loadDetail();
  }, [phone]);

  const loadDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getUserDetail(phone);
      setUser(res.user);
      setHistory(res.history || []);
      setEditName(res.user.full_name);
      setEditPhone(res.user.phone_number);
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        clearAdminToken();
        navigate('/admin', { replace: true });
        return;
      }
      setError(err.message || 'Failed to load user.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!editName.trim()) { setError('Name cannot be empty.'); return; }
    if (!editPhone.trim()) { setError('Phone cannot be empty.'); return; }
    setSaving(true);
    setError('');
    try {
      await adminApi.updateUser(phone, editName.trim(), editPhone.trim());
      setEditingUser(false);
      if (editPhone.trim() !== phone) {
        navigate(`/admin/user/${editPhone.trim()}`, { replace: true });
      } else {
        loadDetail();
      }
    } catch (err) {
      setError(err.message || 'Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`Delete "${user?.full_name}" and ALL their history permanently?`)) return;
    try {
      await adminApi.deleteUser(phone);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete.');
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Delete this calculation entry?')) return;
    try {
      await adminApi.deleteHistory(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete.');
    }
  };

  const startEditHistory = (h) => {
    setEditHistoryId(h.id);
    setEditHistoryJson(JSON.stringify({ input_data: h.input_data, output_data: h.output_data }, null, 2));
  };

  const handleSaveHistory = async () => {
    try {
      const parsed = JSON.parse(editHistoryJson);
      await adminApi.updateHistory(editHistoryId, parsed.input_data, parsed.output_data);
      setEditHistoryId(null);
      loadDetail();
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format.');
      } else {
        setError(err.message || 'Failed to update.');
      }
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin', { replace: true });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <div className="admin-header-left">
            <Link to="/admin/dashboard" className="admin-back-link">← Back</Link>
            <h1 className="admin-title">User Detail</h1>
          </div>
        </header>
        <main className="admin-main"><p className="admin-loading">Loading...</p></main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <div className="admin-header-left">
            <Link to="/admin/dashboard" className="admin-back-link">← Back</Link>
            <h1 className="admin-title">User Detail</h1>
          </div>
        </header>
        <main className="admin-main"><p className="admin-error">User not found.</p></main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <Link to="/admin/dashboard" className="admin-back-link">← Dashboard</Link>
          <h1 className="admin-title">User Detail</h1>
        </div>
        <div className="admin-header-right">
          <button className="layout-theme-toggle" onClick={toggle}>
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
        {error && <p className="admin-error">{error}</p>}

        {/* User Info Card */}
        <div className="admin-detail-card">
          <div className="admin-detail-card-header">
            <h3>User Information</h3>
            <div className="admin-detail-card-actions">
              {!editingUser && (
                <>
                  <button className="admin-btn-edit" onClick={() => setEditingUser(true)}>Edit</button>
                  <button className="admin-btn-delete" onClick={handleDeleteUser}>Delete User</button>
                </>
              )}
            </div>
          </div>

          {editingUser ? (
            <div className="admin-edit-form">
              <label>
                Full Name
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </label>
              <label>
                Phone Number
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 15))} />
              </label>
              <div className="admin-edit-btns">
                <button className="btn-primary" onClick={handleSaveUser} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="btn-secondary" onClick={() => { setEditingUser(false); setEditName(user.full_name); setEditPhone(user.phone_number); }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <dl className="admin-detail-dl">
              <div><dt>Name</dt><dd>{user.full_name}</dd></div>
              <div><dt>Phone</dt><dd>{user.phone_number}</dd></div>
              <div><dt>Joined</dt><dd>{formatDate(user.created_at)}</dd></div>
              <div><dt>Last Active</dt><dd>{formatDate(user.last_verified_at)}</dd></div>
            </dl>
          )}
        </div>

        {/* History Section */}
        <div className="admin-detail-card">
          <div className="admin-detail-card-header">
            <h3>Calculation History ({history.length})</h3>
          </div>

          {history.length === 0 ? (
            <p className="admin-empty">No calculations saved.</p>
          ) : (
            <div className="admin-history-list">
              {history.map((h) => (
                <div key={h.id} className="admin-history-item">
                  <div className="admin-history-top">
                    <span className="admin-history-type">{FEATURE_LABELS[h.feature_type] || h.feature_type}</span>
                    <span className="admin-history-date">{formatDate(h.created_at)}</span>
                  </div>

                  {editHistoryId === h.id ? (
                    <div className="admin-history-edit">
                      <textarea
                        value={editHistoryJson}
                        onChange={(e) => setEditHistoryJson(e.target.value)}
                        rows={10}
                      />
                      <div className="admin-edit-btns">
                        <button className="btn-primary" onClick={handleSaveHistory}>Save</button>
                        <button className="btn-secondary" onClick={() => setEditHistoryId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="admin-history-data">
                        <div className="admin-history-section">
                          <strong>Inputs</strong>
                          {Object.entries(h.input_data || {}).map(([k, v]) => (
                            <div key={k} className="admin-kv">
                              <span>{k.replace(/_/g, ' ')}</span>
                              <span>{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="admin-history-section">
                          <strong>Results</strong>
                          {Object.entries(h.output_data || {}).map(([k, v]) => (
                            <div key={k} className="admin-kv">
                              <span>{k.replace(/_/g, ' ')}</span>
                              <span>{typeof v === 'number' ? formatMoney(v) : String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="admin-history-actions">
                        <button className="admin-btn-edit" onClick={() => startEditHistory(h)}>Edit</button>
                        <button className="admin-btn-delete" onClick={() => handleDeleteHistory(h.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
