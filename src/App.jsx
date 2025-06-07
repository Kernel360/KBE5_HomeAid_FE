import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

function App() {
  return (
    // Remove BrowserRouter wrapper as it's already in main.jsx
    // <BrowserRouter>
    <MatchingRequestStatusProvider>
      <AppRoutes />
    </MatchingRequestStatusProvider>
    // </BrowserRouter>
  );
}

export default App;

