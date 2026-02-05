import { useState } from 'react';
import Layout from '../components/Layout';
import { api, formatMoney, getUserPhone, isSessionValid } from '../api';
import './Calculator.css';

const DESC = 'See the full amount you will pay before bidding. All fees and VAT are added instantly. Avoid surprises and plan better.';

export default function BidToTotal() {
  const [bidAmount, setBidAmount] = useState('');
  const [buyersPremiumPercent, setBuyersPremiumPercent] = useState('');
  const [documentFee, setDocumentFee] = useState('');
  const [vatPercent, setVatPercent] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const bid = Number(bidAmount);
    const bp = Number(buyersPremiumPercent);
    const df = Number(documentFee);
    const v = Number(vatPercent);
    if (!Number.isFinite(bid) || bid <= 0) {
      setError('Enter a valid bid amount.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.calculateTotal({
        bid_amount: bid,
        buyers_premium_percent: bp,
        document_fee: df,
        vat_percent: v,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBidAmount('');
    setBuyersPremiumPercent('');
    setDocumentFee('');
    setVatPercent('');
    setResult(null);
    setError('');
    setSaved(false);
  };

  const handleSave = async () => {
    if (!result) return;
    if (!isSessionValid() || !getUserPhone()) {
      setError('Please enter your name and phone on the home screen first.');
      return;
    }
    setError('');
    try {
      await api.historySave(
        getUserPhone(),
        'bid_to_total',
        {
          bid_amount: bidAmount,
          buyers_premium_percent: buyersPremiumPercent,
          document_fee: documentFee,
          vat_percent: vatPercent,
        },
        result
      );
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    }
  };

  return (
    <Layout title="Bid → Total">
      <p className="feature-desc">{DESC}</p>
      <form onSubmit={handleCalculate} className="calc-form">
        <div className="form-group">
          <label>Bid Amount (₦)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="e.g. 100000"
          />
        </div>
        <div className="form-group">
          <label>Buyer’s Premium (%)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={buyersPremiumPercent}
            onChange={(e) => setBuyersPremiumPercent(e.target.value)}
            placeholder="e.g. 5"
          />
        </div>
        <div className="form-group">
          <label>Document Fee (₦)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={documentFee}
            onChange={(e) => setDocumentFee(e.target.value)}
            placeholder="e.g. 2860"
          />
        </div>
        <div className="form-group">
          <label>VAT (%)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={vatPercent}
            onChange={(e) => setVatPercent(e.target.value)}
            placeholder="e.g. 15"
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="actions-row">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Calculating…' : 'Calculate'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="result-card">
          <div className="result-row">
            <span>Bid</span>
            <span className="result-value">₦{formatMoney(result.bid)}</span>
          </div>
          <div className="result-row">
            <span>Buyer’s Premium</span>
            <span className="result-value">₦{formatMoney(result.buyers_premium)}</span>
          </div>
          <div className="result-row">
            <span>Document Fee</span>
            <span className="result-value">₦{formatMoney(result.document_fee)}</span>
          </div>
          <div className="result-row">
            <span>Subtotal</span>
            <span className="result-value">₦{formatMoney(result.subtotal)}</span>
          </div>
          <div className="result-row">
            <span>VAT</span>
            <span className="result-value">₦{formatMoney(result.vat)}</span>
          </div>
          <div className="result-row highlight">
            <span>Total Payable</span>
            <span className="result-value">₦{formatMoney(result.total)}</span>
          </div>
          <div className="actions-row" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-primary" onClick={handleSave} disabled={saved}>
              {saved ? 'Saved' : 'Save to history'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
