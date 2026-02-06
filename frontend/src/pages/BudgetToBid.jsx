import { useState } from 'react';
import Layout from '../components/Layout';
import { api, formatMoney, getUserPhone, isSessionValid } from '../api';
import './Calculator.css';

const DESC = 'Turn your budget into the correct bid amount. VAT and fees are removed automatically. Use this when you know how much you want to spend.';

export default function BudgetToBid({ onLogout }) {
  const [targetTotal, setTargetTotal] = useState('');
  const [vatPercent, setVatPercent] = useState('');
  const [buyersPremiumPercent, setBuyersPremiumPercent] = useState('');
  const [documentFee, setDocumentFee] = useState('');
  const [includeExtraFee, setIncludeExtraFee] = useState(false);
  const [extraFee, setExtraFee] = useState(0);
  const [payingInCash, setPayingInCash] = useState(false);
  const [cashFeePercent, setCashFeePercent] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const tt = Number(targetTotal);
    const v = Number(vatPercent);
    const bp = Number(buyersPremiumPercent);
    const df = Number(documentFee);
    if (!Number.isFinite(tt) || tt <= 0) {
      setError('Enter a valid target total.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.calculateBid({
        target_total: tt,
        vat_percent: v,
        buyers_premium_percent: bp,
        document_fee: df,
        extra_fee: includeExtraFee ? (Number(extraFee) || 0) : 0,
        paying_in_cash: payingInCash,
        cash_fee_percent: payingInCash ? (Number(cashFeePercent) || 0) : 0,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTargetTotal('');
    setVatPercent('');
    setBuyersPremiumPercent('');
    setDocumentFee('');
    setIncludeExtraFee(false);
    setExtraFee(0);
    setPayingInCash(false);
    setCashFeePercent(0);
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
        'budget_to_bid',
        {
          target_total: targetTotal,
          vat_percent: vatPercent,
          buyers_premium_percent: buyersPremiumPercent,
          document_fee: documentFee,
          extra_fee: includeExtraFee ? (Number(extraFee) || 0) : 0,
          paying_in_cash: payingInCash,
          cash_fee_percent: payingInCash ? (Number(cashFeePercent) || 0) : 0,
        },
        result
      );
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    }
  };

  return (
    <Layout title="Budget → Bid" onLogout={onLogout}>
      <p className="feature-desc">{DESC}</p>
      <form onSubmit={handleCalculate} className="calc-form">
        <div className="form-group">
          <label>Target Total</label>
          <input
            type="number"
            step="any"
            min="0"
            value={targetTotal}
            onChange={(e) => setTargetTotal(e.target.value)}
            placeholder="e.g. 150000"
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
        <div className="form-group">
          <label>Buyer's Premium (%)</label>
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
          <label>Document Fee</label>
          <input
            type="number"
            step="any"
            min="0"
            value={documentFee}
            onChange={(e) => setDocumentFee(e.target.value)}
            placeholder="e.g. 2860"
          />
        </div>
        <div className="form-group form-group-checkbox">
          <label>
            <input
              type="checkbox"
              checked={includeExtraFee}
              onChange={(e) => setIncludeExtraFee(e.target.checked)}
            />
            Include Extra Fee
          </label>
        </div>
        {includeExtraFee && (
          <div className="form-group">
            <label>Extra Fee</label>
            <input
              type="number"
              step="any"
              min="0"
              value={extraFee}
              onChange={(e) => setExtraFee(Number(e.target.value) || 0)}
              placeholder="Extra Fee"
            />
          </div>
        )}
        <div className="form-group form-group-checkbox">
          <label>
            <input
              type="checkbox"
              checked={payingInCash}
              onChange={(e) => setPayingInCash(e.target.checked)}
            />
            Paying in Cash?
          </label>
        </div>
        {payingInCash && (
          <div className="form-group">
            <label>Cash Handling Fee (%)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={cashFeePercent}
              onChange={(e) => setCashFeePercent(Number(e.target.value) || 0)}
              placeholder="Cash Handling Fee (%)"
            />
          </div>
        )}
        {error && <p className="form-error">{error}</p>}
        <div className="actions-row">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="result-card">
          <div className="result-row">
            <span>Subtotal</span>
            <span className="result-value">{formatMoney(result.subtotal)}</span>
          </div>
          <div className="result-row">
            <span>VAT Amount</span>
            <span className="result-value">{formatMoney(result.vat_amount)}</span>
          </div>
          <div className="result-row">
            <span>Buyer's Premium</span>
            <span className="result-value">{formatMoney(result.buyers_premium)}</span>
          </div>
          <div className="result-row">
            <span>Document Fee</span>
            <span className="result-value">{formatMoney(result.document_fee)}</span>
          </div>
          {(result.extra_fee != null && result.extra_fee > 0) && (
            <div className="result-row">
              <span>Extra Fee</span>
              <span className="result-value">{formatMoney(result.extra_fee)}</span>
            </div>
          )}
          {(result.cash_fee != null && result.cash_fee > 0) && (
            <div className="result-row">
              <span>Cash Handling Fee</span>
              <span className="result-value">{formatMoney(result.cash_fee)}</span>
            </div>
          )}
          <div className="result-row highlight">
            <span>Estimated Bid</span>
            <span className="result-value">{formatMoney(result.estimated_bid)}</span>
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
