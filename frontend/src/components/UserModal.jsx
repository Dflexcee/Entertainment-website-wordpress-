import { useState } from 'react';
import { api, setUserSession } from '../api';
import './UserModal.css';

export default function UserModal({ onVerified }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhone(v);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (phone.length !== 11) {
      setError('Phone must be 11 digits (e.g. 08012345678).');
      return;
    }
    setLoading(true);
    try {
      await api.verifyUser(fullName.trim(), phone);
      setUserSession(phone);
      onVerified();
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-modal-overlay">
      <div className="user-modal">
        <h2>Welcome to BizTools</h2>
        <p className="user-modal-sub">Enter your details to continue. No password needed.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Okonkwo"
              autoComplete="name"
              disabled={loading}
            />
          </label>
          <label>
            Phone Number (11 digits)
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="08012345678"
              autoComplete="tel"
              disabled={loading}
            />
          </label>
          {error && <p className="user-modal-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
