import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './ThemeContext';
import Welcome from './pages/Welcome';
import BudgetToBid from './pages/BudgetToBid';
import BidToTotal from './pages/BidToTotal';
import Profit from './pages/Profit';
import History from './pages/History';
import UserModal from './components/UserModal';
import { isSessionValid, getUserPhone, clearSession } from './api';

export default function App() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    if (isSessionValid() && getUserPhone()) {
      setShowUserModal(false);
    } else {
      setShowUserModal(true);
    }
    setSessionChecked(true);
  }, []);

  const onVerified = () => setShowUserModal(false);
  const needUser = () => {
    if (!isSessionValid() || !getUserPhone()) setShowUserModal(true);
  };

  const handleLogout = () => {
    clearSession();
    setShowUserModal(true);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        {sessionChecked && showUserModal && (
          <UserModal onVerified={onVerified} />
        )}
        <Routes>
          <Route path="/" element={<Welcome onOpenFeature={needUser} onLogout={handleLogout} />} />
          <Route path="/budget-to-bid" element={<BudgetToBid onLogout={handleLogout} />} />
          <Route path="/bid-to-total" element={<BidToTotal onLogout={handleLogout} />} />
          <Route path="/profit" element={<Profit onLogout={handleLogout} />} />
          <Route path="/history" element={<History onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
