import { useState } from 'react';
import Layout from '../components/Layout';
import { api, formatMoney, getUserPhone, isSessionValid } from '../api';
import './Calculator.css';

const DESC = 'Calculate your profit and selling price. Total cost = purchase + expenses. Selling price = cost x multiple. Extra fee is added on top of selling price.';

export default function Profit({ onLogout }) {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [totalExpenses, setTotalExpenses] = useState('');
  const [sellingMultiple, setSellingMultiple] = useState('');
  const [includeExtraFee, setIncludeExtraFee] = useState(false);
  const [extraFee, setExtraFee] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const purchase = Number(purchasePrice) || 0;
    const expenses = Number(totalExpenses) || 0;
    const multiple = Number(sellingMultiple) || 0;
    const extra = includeExtraFee ? (Number(extraFee) || 0) : 0;
    if (!Number.isFinite(purchase) || purchase < 0) {
      setError('Enter a valid purchase price.');
      return;
    }
    if (!Number.isFinite(multiple) || multiple <= 0) {
      setError('Enter a selling multiple greater than 0 (e.g. 3 for 3x cost).');
      return;
    }
    setLoading(true);
    try {
      const data = await api.calculateProfit({
        purchase_price: purchase,
        total_expenses: expenses,
        selling_multiple: multiple,
        extra_fee: extra,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPurchasePrice('');
    setTotalExpenses('');
    setSellingMultiple('');
    setIncludeExtraFee(false);
    setExtraFee('');
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
        'profit',
        {
          purchase_price: purchasePrice,
          total_expenses: totalExpenses,
          selling_multiple: sellingMultiple,
          extra_fee: includeExtraFee ? (Number(extraFee) || 0) : 0,
        },
        result
      );
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    }
  };

  return (
    <Layout title="Selling Price & Profit" onLogout={onLogout}>
      <p className="feature-desc">{DESC}</p>
      <form onSubmit={handleCalculate} className="calc-form">
        <div className="form-group">
          <label>Purchase Price</label>
          <input
            type="number"
            step="any"
            min="0"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="e.g. 50000"
          />
        </div>
        <div className="form-group">
          <label>Total Expenses</label>
          <input
            type="number"
            step="any"
            min="0"
            value={totalExpenses}
            onChange={(e) => setTotalExpenses(e.target.value)}
            placeholder="e.g. 10000"
          />
        </div>
        <div className="form-group">
          <label>Selling multiple (x cost)</label>
          <input
            type="number"
            step="any"
            min="0.01"
            value={sellingMultiple}
            onChange={(e) => setSellingMultiple(e.target.value)}
            placeholder="e.g. 3 = sell at 3x cost"
          />
        </div>
        <div className="form-group form-group-radio">
          <span className="radio-label">Include Extra Fee?</span>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="extraFeeToggle"
                checked={!includeExtraFee}
                onChange={() => { setIncludeExtraFee(false); setExtraFee(''); }}
              />
              <span className="radio-dot" />
              No
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="extraFeeToggle"
                checked={includeExtraFee}
                onChange={() => setIncludeExtraFee(true)}
              />
              <span className="radio-dot" />
              Yes
            </label>
          </div>
        </div>
        {includeExtraFee && (
          <div className="form-group">
            <label>Extra Fee</label>
            <input
              type="number"
              step="any"
              min="0"
              value={extraFee}
              onChange={(e) => setExtraFee(e.target.value)}
              placeholder="e.g. 500 (added on top of selling price)"
            />
            <span className="form-hint">Added after selling price.</span>
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
            <span>Purchase Cost</span>
            <span className="result-value">{formatMoney(purchasePrice)}</span>
          </div>
          <div className="result-row">
            <span>Total Expenses</span>
            <span className="result-value">{formatMoney(totalExpenses)}</span>
          </div>
          <div className="result-row">
            <span>Total Cost</span>
            <span className="result-value">{formatMoney(result.total_cost)}</span>
          </div>
          <div className="result-row">
            <span>Selling multiple</span>
            <span className="result-value">{formatMoney(result.selling_multiple)}x</span>
          </div>
          <div className="result-row">
            <span>Profit</span>
            <span className="result-value">{formatMoney(result.profit_value)}</span>
          </div>
          <div className="result-row">
            <span>Selling Price</span>
            <span className="result-value">{formatMoney(result.selling_price)}</span>
          </div>
          {(result.extra_fee != null && result.extra_fee > 0) && (
            <div className="result-row">
              <span>Extra Fee (added on top)</span>
              <span className="result-value">{formatMoney(result.extra_fee)}</span>
            </div>
          )}
          <div className="result-row highlight">
            <span>Total Selling Price</span>
            <span className="result-value">{formatMoney(result.total_selling_price)}</span>
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
