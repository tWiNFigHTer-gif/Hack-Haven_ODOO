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
// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminPlansPage } from './pages/admin/AdminPlansPage';
import { AdminQuotationsPage } from './pages/admin/AdminQuotationsPage';
import { AdminDiscountsPage } from './pages/admin/AdminDiscountsPage';
import { AdminTaxesPage } from './pages/admin/AdminTaxesPage';
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminInvoicesPage } from './pages/admin/AdminInvoicesPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';
// Staff pages
import { StaffTodayPage } from './pages/staff/StaffTodayPage';
import { StaffQuotationsPage } from './pages/staff/StaffQuotationsPage';
import { StaffSubscriptionsPage } from './pages/staff/StaffSubscriptionsPage';
import { StaffInvoicesPage } from './pages/staff/StaffInvoicesPage';
import { StaffPaymentsPage } from './pages/staff/StaffPaymentsPage';

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
        <Routes>
          {/* ── Admin routes (own layout – no customer Navbar/Footer) ── */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/plans" element={<AdminPlansPage />} />
          <Route path="/admin/quotations" element={<AdminQuotationsPage />} />
          <Route path="/admin/discounts" element={<AdminDiscountsPage />} />
          <Route path="/admin/taxes" element={<AdminTaxesPage />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="/admin/subscriptions/:id" element={<AdminSubscriptionsPage />} />
          <Route path="/admin/invoices" element={<AdminInvoicesPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/staff" element={<AdminStaffPage />} />

          {/* ── Staff Portal routes (top navigation tabs, teal theme) ── */}
          <Route path="/staff" element={<Navigate to="/staff/today" replace />} />
          <Route path="/staff/today" element={<StaffTodayPage />} />
          <Route path="/staff/quotations" element={<StaffQuotationsPage />} />
          <Route path="/staff/subscriptions" element={<StaffSubscriptionsPage />} />
          <Route path="/staff/subscriptions/:id" element={<StaffSubscriptionsPage />} />
          <Route path="/staff/invoices" element={<StaffInvoicesPage />} />
          <Route path="/staff/payments" element={<StaffPaymentsPage />} />

          {/* Role block for staff attempting to access forbidden admin routes */}
          <Route path="/staff/products" element={<Navigate to="/staff/today" replace />} />
          <Route path="/staff/plans" element={<Navigate to="/staff/today" replace />} />
          <Route path="/staff/discounts" element={<Navigate to="/staff/today" replace />} />
          <Route path="/staff/taxes" element={<Navigate to="/staff/today" replace />} />
          <Route path="/staff/dashboard" element={<Navigate to="/staff/today" replace />} />

          {/* ── Customer portal routes (Navbar + Footer) ── */}
          <Route
            path="/*"
            element={
              <LayoutWrapper user={user} onLogout={() => setUser(null)}>
                <Routes>
                  <Route path="/login" element={<AuthPage onLoginSuccess={(u) => setUser(u)} />} />
                  <Route path="/signup" element={<AuthPage onLoginSuccess={(u) => setUser(u)} />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/subscriptions" element={<SubscriptionsPage />} />
                  <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
                  <Route path="*" element={<Navigate to="/subscriptions" replace />} />
                </Routes>
              </LayoutWrapper>
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
