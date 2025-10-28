import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { AuthProvider } from './contexts/AuthContext';
import { CreditProvider } from './contexts/CreditContext';
import { TryOnProvider } from './contexts/TryOnContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import VirtualTryOn from './pages/VirtualTryOn';
import { History } from './pages/History';

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
              <SidebarProvider>
                <Routes>
                  {/* Public routes without sidebar */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected routes with sidebar */}
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/tryon" element={<VirtualTryOn />} />
                            <Route path="/history" element={<History />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </SidebarProvider>
            </TryOnProvider>
          </CreditProvider>
        </SWRConfig>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
