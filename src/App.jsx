import React from 'react';
// Remove BrowserRouter import as it's already in main.jsx
import { BrowserRouter } from 'react-router-dom';
import { MatchingRequestStatusProvider } from './contexts/MatchingRequestStatusContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    // Remove BrowserRouter wrapper as it's already in main.jsx
    <BrowserRouter>
      <MatchingRequestStatusProvider>
        <AppRoutes />
      </MatchingRequestStatusProvider>
    </BrowserRouter>
  );
}

export default App;
