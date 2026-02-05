import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Welcome from './pages/Welcome';
import BudgetToBid from './pages/BudgetToBid';
import BidToTotal from './pages/BidToTotal';
import Profit from './pages/Profit';
import History from './pages/History';
import UserModal from './components/UserModal';
import { isSessionValid, getUserPhone } from './api';

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

  return (
    <BrowserRouter>
      {sessionChecked && showUserModal && (
        <UserModal onVerified={onVerified} />
      )}
      <Routes>
        <Route path="/" element={<Welcome onOpenFeature={needUser} />} />
        <Route path="/budget-to-bid" element={<BudgetToBid />} />
        <Route path="/bid-to-total" element={<BidToTotal />} />
        <Route path="/profit" element={<Profit />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
