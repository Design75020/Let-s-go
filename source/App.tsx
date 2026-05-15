
import React, { useMemo, useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './features/auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load feature components
const LandingPage = lazy(() => import('./features/marketplace/LandingPage'));
const ClientStore = lazy(() => import('./features/marketplace/ClientStore'));
const OrderTracking = lazy(() => import('./features/marketplace/OrderTracking'));
const MerchantPortal = lazy(() => import('./features/merchant/MerchantPortal'));
const DriverApp = lazy(() => import('./features/driver/DriverApp'));
const AdminPortal = lazy(() => import('./features/admin/AdminPortal'));
const DevLaunchpad = lazy(() => import('./components/DevLaunchpad'));
const DevAgentDashboard = lazy(() => import('./components/DevAgentDashboard'));
const Login = lazy(() => import('./features/auth/Login'));

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Kernel...</p>
    </div>
  </div>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const hostname = window.location.hostname;
  const searchParams = new URLSearchParams(window.location.search);
  const viewParam = searchParams.get('view');

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const AppContent = useMemo(() => {
    if (!isReady) return <LoadingScreen />;

    if (viewParam) {
      switch (viewParam) {
        case 'landing': return <LandingPage />;
        case 'app': return <ProtectedRoute><ClientStore /></ProtectedRoute>;
        case 'merchant': return <ProtectedRoute><MerchantPortal /></ProtectedRoute>;
        case 'driver': return <ProtectedRoute><DriverApp /></ProtectedRoute>;
        case 'admin': return <ProtectedRoute><AdminPortal /></ProtectedRoute>;
        case 'agent': return <ProtectedRoute><DevAgentDashboard /></ProtectedRoute>;
        case 'dev': return <DevLaunchpad />;
      }
    }

    switch (hostname) {
      case 'letsgofood.fr':
        return <LandingPage />;
      
      case 'app.letsgofood.fr':
        return <ProtectedRoute><ClientStore /></ProtectedRoute>;

      case 'merchant.letsgofood.fr':
        return <ProtectedRoute><MerchantPortal /></ProtectedRoute>;

      case 'driver.letsgofood.fr':
        return <ProtectedRoute><DriverApp /></ProtectedRoute>;

      case 'admin.letsgofood.fr':
      case 'saas.letsgofood.fr':
      case 'crm.letsgofood.fr':
        return <ProtectedRoute><AdminPortal /></ProtectedRoute>;

      default:
        return (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<ProtectedRoute><ClientStore /></ProtectedRoute>} />
            <Route path="/tracking/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
            <Route path="/merchant/*" element={<ProtectedRoute><MerchantPortal /></ProtectedRoute>} />
            <Route path="/driver/*" element={<ProtectedRoute><DriverApp /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute><AdminPortal /></ProtectedRoute>} />
            <Route path="/agent" element={<ProtectedRoute><DevAgentDashboard /></ProtectedRoute>} />
            <Route path="/dev" element={<DevLaunchpad />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        );
    }
  }, [hostname, viewParam, isReady]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          {AppContent}
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
