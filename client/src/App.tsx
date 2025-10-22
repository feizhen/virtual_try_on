import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
