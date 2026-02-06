import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api, formatMoney, getUserPhone, isSessionValid } from '../api';
import './History.css';

const FEATURE_LABELS = {
  budget_to_bid: 'Budget → Bid',
  bid_to_total: 'Bid → Total',
  profit: 'Selling Price & Profit',
};

function formatDate(s) {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return s;
  }
}

function getSummaryLine(item) {
  const { feature_type: featureType, input_data: inputData, output_data: outputData } = item;
  if (featureType === 'budget_to_bid') {
    const total = inputData?.target_total ?? outputData?.subtotal;
    const bid = outputData?.estimated_bid;
    return total != null && bid != null ? `${formatMoney(total)} → ${formatMoney(bid)}` : '—';
  }
  if (featureType === 'bid_to_total') {
    const bid = inputData?.bid_amount ?? outputData?.bid;
    const total = outputData?.total;
    return bid != null && total != null ? `${formatMoney(bid)} → ${formatMoney(total)}` : '—';
  }
  if (featureType === 'profit') {
    const cost = outputData?.total_cost;
    const sell = outputData?.total_selling_price ?? outputData?.selling_price;
    return cost != null && sell != null ? `Cost: ${formatMoney(cost)} | Sell: ${formatMoney(sell)}` : '—';
  }
  return '—';
}

function shouldShowInputField(key, value, inputData) {
  if (value === null || value === undefined) return false;
  if (key === 'extra_fee' && (value === 0 || value === '0')) return false;
  if (key === 'paying_in_cash' && !value) return false;
  if (key === 'cash_fee_percent' && (!inputData?.paying_in_cash || value === 0 || value === '0')) return false;
  return true;
}

function shouldShowOutputField(key, value) {
  if (value === null || value === undefined) return false;
  if (key === 'cash_fee' && (value === 0 || value === '0')) return false;
  if (key === 'extra_fee' && (value === 0 || value === '0')) return false;
  return true;
}

function formatInputValue(key, value) {
  if (key === 'paying_in_cash') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return Number.isInteger(value) ? value : formatMoney(value);
  return String(value);
}

export default function History({ onLogout }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailId, setDetailId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const userPhone = getUserPhone();
  const hasSession = isSessionValid() && userPhone;

  const load = async () => {
    if (!hasSession) {
      setList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.historyList(userPhone);
      setList(res.history || []);
    } catch (err) {
      setError(err.message || 'Failed to load history.');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [hasSession, userPhone]);

  const handleDeleteOne = async (id) => {
    if (!hasSession) return;
    try {
      await api.historyDelete(userPhone, id);
      setDetailId(null);
      load();
    } catch (err) {
      setError(err.message || 'Failed to delete.');
    }
  };

  const handleClearAll = async () => {
    if (!hasSession || !window.confirm('Clear all history? This cannot be undone.')) return;
    setClearing(true);
    setError('');
    try {
      await api.historyDelete(userPhone);
      setDetailId(null);
      setList([]);
    } catch (err) {
      setError(err.message || 'Failed to clear.');
    } finally {
      setClearing(false);
    }
  };

  const selected = detailId != null ? list.find((h) => h.id === detailId) : null;

  if (!hasSession) {
    return (
      <Layout title="History" onLogout={onLogout}>
        <p className="history-empty">
          Enter your name and phone on the home screen to save and view history.
        </p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
          Go to Home
        </Link>
      </Layout>
    );
  }

  return (
    <Layout title="History" onLogout={onLogout}>
      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p className="history-loading">Loading...</p>
      ) : list.length === 0 ? (
        <p className="history-empty">No saved calculations yet. Use a calculator and tap "Save to history".</p>
      ) : (
        <>
          <ul className="history-list">
            {list.map((item) => (
              <li key={item.id} className="history-item">
                <button
                  type="button"
                  className="history-item-btn"
                  onClick={() => setDetailId(detailId === item.id ? null : item.id)}
                >
                  <span className="history-item-feature">{FEATURE_LABELS[item.feature_type] || item.feature_type}</span>
                  <span className="history-item-summary">{getSummaryLine(item)}</span>
                  <span className="history-item-date">{formatDate(item.created_at)}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-secondary history-clear"
            onClick={handleClearAll}
            disabled={clearing}
          >
            {clearing ? 'Clearing...' : 'Clear all history'}
          </button>
        </>
      )}

      {selected && (
        <div className="history-detail-overlay" onClick={() => setDetailId(null)}>
          <div className="history-detail" onClick={(e) => e.stopPropagation()}>
            <h3>{FEATURE_LABELS[selected.feature_type]} – Details</h3>
            <section className="history-detail-section">
              <h4>Inputs</h4>
              <dl className="history-detail-dl">
                {Object.entries(selected.input_data || {})
                  .filter(([k, v]) => shouldShowInputField(k, v, selected.input_data))
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt>{k.replace(/_/g, ' ')}</dt>
                      <dd>{formatInputValue(k, v)}</dd>
                    </div>
                  ))}
              </dl>
            </section>
            <section className="history-detail-section">
              <h4>Results</h4>
              <dl className="history-detail-dl">
                {Object.entries(selected.output_data || {})
                  .filter(([k, v]) => shouldShowOutputField(k, v))
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt>{k.replace(/_/g, ' ')}</dt>
                      <dd>{typeof v === 'number' ? formatMoney(v) : String(v)}</dd>
                    </div>
                  ))}
              </dl>
            </section>
            <p className="history-detail-date">Date: {formatDate(selected.created_at)}</p>
            <div className="history-detail-actions">
              <button type="button" className="btn-secondary" onClick={() => setDetailId(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: '#DC2626', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)' }}
                onClick={() => handleDeleteOne(selected.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
