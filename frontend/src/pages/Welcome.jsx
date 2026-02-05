import { Link } from 'react-router-dom';
import './Welcome.css';

export default function Welcome({ onOpenFeature }) {
  const handleFeatureClick = () => onOpenFeature();

  return (
    <div className="welcome">
      <header className="welcome-header">
        <h1 className="welcome-brand">BizTools</h1>
        <p className="welcome-slogan">Calculate smarter. Earn better.</p>
        <p className="welcome-tagline">Smart tools to calculate bids, costs & profit.</p>
      </header>

      <nav className="welcome-nav">
        <Link to="/budget-to-bid" className="welcome-btn" onClick={handleFeatureClick}>
          Budget → Bid
        </Link>
        <Link to="/bid-to-total" className="welcome-btn" onClick={handleFeatureClick}>
          Bid → Total
        </Link>
        <Link to="/profit" className="welcome-btn" onClick={handleFeatureClick}>
          Selling Price & Profit
        </Link>
        <Link to="/history" className="welcome-link-history" onClick={handleFeatureClick}>
          History
        </Link>
      </nav>
    </div>
  );
}
