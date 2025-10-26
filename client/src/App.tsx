import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { AuthProvider } from './contexts/AuthContext';
import { CreditProvider } from './contexts/CreditContext';
import { TryOnProvider } from './contexts/TryOnContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import VirtualTryOn from './pages/VirtualTryOn';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SWRConfig
          value={{
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 2000,
            errorRetryCount: 3,
            shouldRetryOnError: true,
          }}
        >
          <CreditProvider>
            <TryOnProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tryon"
                  element={
                    <ProtectedRoute>
                      <VirtualTryOn />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </TryOnProvider>
          </CreditProvider>
        </SWRConfig>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
