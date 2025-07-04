import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { useThemeStore } from './stores/themeStore';
// import { useAuthStore } from './stores/authStore';
// import sseEmitter from './features/alert/sseEmitter';
import './App.css';
import { SSEProvider } from '@/features/alert/SSEProvider';

function App() {
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // const { user, accessToken } = useAuthStore();

  // useEffect(() => {
  //   if (user && accessToken && !sseEmitter.isConnected()) {
  //     sseEmitter.connection();
  //   }
  // }, [user, accessToken]);

  return (
    <Router>
      <SSEProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </SSEProvider>
    </Router>
  );
}

export default App;
