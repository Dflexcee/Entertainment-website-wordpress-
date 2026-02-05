import { useState } from 'react';
import Layout from '../components/Layout';
import { api, formatMoney, getUserPhone, isSessionValid } from '../api';
import './Calculator.css';

const DESC = 'Calculate your profit and ideal selling price. Enter your costs and desired margin. Make smarter pricing decisions.';

export default function Profit() {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [totalExpenses, setTotalExpenses] = useState('');
  const [profitPercent, setProfitPercent] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const purchase = Number(purchasePrice);
    const expenses = Number(totalExpenses);
    const pct = Number(profitPercent);
    if (!Number.isFinite(purchase) || purchase < 0) {
      setError('Enter a valid purchase price.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.calculateProfit({
        purchase_price: purchase,
        total_expenses: expenses,
        profit_percentage: pct,
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
    setProfitPercent('');
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
          profit_percentage: profitPercent,
        },
        result
      );
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    }
  };

  return (
    <Layout title="Selling Price & Profit">
      <p className="feature-desc">{DESC}</p>
      <form onSubmit={handleCalculate} className="calc-form">
        <div className="form-group">
          <label>Purchase Price (₦)</label>
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
          <label>Total Expenses (₦)</label>
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
          <label>Profit (%)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={profitPercent}
            onChange={(e) => setProfitPercent(e.target.value)}
            placeholder="e.g. 20"
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
            <span>Total Cost</span>
            <span className="result-value">₦{formatMoney(result.total_cost)}</span>
          </div>
          <div className="result-row">
            <span>Profit Value</span>
            <span className="result-value">₦{formatMoney(result.profit_value)}</span>
          </div>
          <div className="result-row">
            <span>Profit %</span>
            <span className="result-value">{formatMoney(result.profit_percentage)}%</span>
          </div>
          <div className="result-row highlight">
            <span>Selling Price</span>
            <span className="result-value">₦{formatMoney(result.selling_price)}</span>
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
