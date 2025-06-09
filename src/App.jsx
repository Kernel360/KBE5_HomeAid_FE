import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { MatchingRequestStatusProvider } from './contexts/MatchingRequestStatusContext'; // Removed deleted context

// User components
import UserServiceOption from './features/reservation/components/UserServiceOption';
import UserServiceSubOption from './features/reservation/components/UserServiceSubOption';
import UserServiceOptionCart from './features/reservation/components/UserServiceOptionCart';
import UserServiceRequest from './features/reservation/components/UserServiceRequest';
import UserPayment from './features/payment/pages/UserPayment';
import UserPaymentComplete from './features/payment/pages/UserPaymentComplete';

// Manager components
import ManagerMatchingRequest from './features/matching/pages/ManagerMatchingRequest';
import ManagerServiceCheckIn from './features/matching/pages/ManagerServiceCheckIn';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* User routes */}
          <Route path="/user/service-option" element={<UserServiceOption />} />
          <Route
            path="/user/service-sub-option"
            element={<UserServiceSubOption />}
          />
          <Route
            path="/user/service-option-cart"
            element={<UserServiceOptionCart />}
          />
          <Route
            path="/user/service-request"
            element={<UserServiceRequest />}
          />
          <Route path="/user/payment" element={<UserPayment />} />
          <Route
            path="/user/payment-complete"
            element={<UserPaymentComplete />}
          />

          {/* Manager routes */}
          <Route
            path="/matching/matching-request"
            element={<ManagerMatchingRequest />}
          />
          <Route
            path="/matching/service-checkin"
            element={<ManagerServiceCheckIn />}
          />

          {/* Default route */}
          <Route path="/" element={<UserServiceOption />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
