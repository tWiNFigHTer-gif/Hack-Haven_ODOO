import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { api, User } from './lib/api';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { SubscriptionDetailPage } from './pages/SubscriptionDetailPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage';

const LayoutWrapper: React.FC<{
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}> = ({ user, onLogout, children }) => {
  const location = useLocation();
  const isAuthRoute =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password';

  return (
    <div className="min-h-screen flex flex-col bg-background-canvas text-on-surface antialiased">
      {!isAuthRoute && <Navbar user={user} onLogout={onLogout} />}
      <div className="flex-1 flex flex-col">{children}</div>
      {!isAuthRoute && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const u = await api.auth.getCurrentUser();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    }
    checkAuth();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background-canvas flex items-center justify-center">
        <span className="material-symbols-outlined text-[36px] text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <LayoutWrapper user={user} onLogout={() => setUser(null)}>
          <Routes>
            <Route
              path="/login"
              element={<AuthPage onLoginSuccess={(u) => setUser(u)} />}
            />
            <Route
              path="/signup"
              element={<AuthPage onLoginSuccess={(u) => setUser(u)} />}
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="*" element={<Navigate to="/subscriptions" replace />} />
          </Routes>
        </LayoutWrapper>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
