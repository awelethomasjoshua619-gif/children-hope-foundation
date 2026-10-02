import React, { useEffect } from 'react';
import { Route, Routes, useLocation, Link, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Spinner } from './components/Spinner';

import { HomePage } from './pages/HomePage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignPage } from './pages/CampaignPage';
import { DonateSuccessPage } from './pages/DonateSuccessPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TransparencyPage } from './pages/TransparencyPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCampaignsPage } from './pages/admin/AdminCampaignsPage';
import { AdminDonationsPage } from './pages/admin/AdminDonationsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Route guard: requires a signed-in user (optionally admin). */
function RequireAuth({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:slug" element={<CampaignPage />} />
          <Route path="/donate/success" element={<DonateSuccessPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/transparency" element={<TransparencyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <RequireAuth adminOnly>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="campaigns" element={<AdminCampaignsPage />} />
            <Route path="donations" element={<AdminDonationsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center space-y-4">
      <h1 className="text-5xl font-black text-slate-900">404</h1>
      <p className="text-slate-600">The page you're looking for doesn't exist or has moved.</p>
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
