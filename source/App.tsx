/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DevLaunchpad from './components/DevLaunchpad';
import ClientApp from './components/ClientApp';
import Store from './components/Store';
import OrderTracking from './components/OrderTracking';
import Login from './components/Login';
import SaaSDashboard from './components/SaaSDashboard';
import MerchantDashboard from './components/MerchantDashboard';
import DriverDashboard from './components/DriverDashboard';
import AdminPanel from './components/AdminPanel';
import CRMPanel from './components/CRMPanel';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Loader2 } from 'lucide-react';

/**
 * Domain-based Dispatcher (Enterprise Multi-App Architecture)
 * Enforces strict isolation between different business verticals.
 */
const DomainDispatcher = ({ view: propView }: { view?: string | null }) => {
  const hostname = window.location.hostname.toLowerCase();
  const [searchParams] = useSearchParams();
  const view = propView || searchParams.get('view');

  const isDev = hostname.includes('.run.app') || hostname.includes('localhost') || hostname.includes('github.dev');

  // Preview Mode / Development Routing (via ?view= parameter)
  // This logic is prioritized for AI Studio environments
  if (isDev) {
    if (!view || view === 'default') {
      return <DevLaunchpad />;
    }

    switch (view) {
      case 'landing': return <LandingPage />;
      case 'app': return <ClientAppRoutes />;
      case 'merchant': return <MerchantRoutes />;
      case 'driver': return <DriverRoutes />;
      case 'saas': return <SaaSRoutes />;
      case 'crm': return <CRMRoutes />;
      case 'admin': return <AdminRoutes />;
      default: return <DevLaunchpad />;
    }
  }

  // Multi-Domain Routing Logic (Strict Switch for Production)
  switch (hostname) {
    case 'letsgofood.fr':
    case 'www.letsgofood.fr':
      return <LandingPage />;
    case 'app.letsgofood.fr':
      return <ClientAppRoutes />;
    case 'merchant.letsgofood.fr':
      return <MerchantRoutes />;
    case 'driver.letsgofood.fr':
      return <DriverRoutes />;
    case 'saas.letsgofood.fr':
      return <SaaSRoutes />;
    case 'crm.letsgofood.fr':
      return <CRMRoutes />;
    case 'admin.letsgofood.fr':
      return <AdminRoutes />;
    default:
      return <UnauthorizedDomain />;
  }
};

/**
 * Isolated Application Scope: Client App
 */
const ClientAppRoutes = () => (
  <Routes>
    <Route path="/" element={<ClientApp />} />
    <Route path="/store/:id" element={<Store />} />
    <Route path="/track/:id" element={<OrderTracking />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/**
 * Isolated Application Scope: Merchant
 */
const MerchantRoutes = () => (
  <Routes>
    <Route path="/" element={<ProtectedRoute><MerchantDashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/**
 * Isolated Application Scope: Driver
 */
const DriverRoutes = () => (
  <Routes>
    <Route path="/" element={<ProtectedRoute><DriverDashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/**
 * Isolated Application Scope: SaaS
 */
const SaaSRoutes = () => (
  <Routes>
    <Route path="/" element={<ProtectedRoute><SaaSDashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/**
 * Isolated Application Scope: CRM
 */
const CRMRoutes = () => (
  <Routes>
    <Route path="/" element={<ProtectedRoute><CRMPanel /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/**
 * Isolated Application Scope: Admin
 */
const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/**
 * Unauthorized Domain Fallback
 */
const UnauthorizedDomain = () => (
  <div className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center p-8 text-center">
    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
      <Loader2 className="w-10 h-10 text-red-500 opacity-50" />
    </div>
    <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2">DOMAIN UNAUTHORIZED</h1>
    <p className="text-white/40 max-w-sm text-sm">
      This domain is not configured within the LetsGoFood Multi-App Ecosystem. 
      Please contact your administrator for provisioning at letsgofood.fr
    </p>
  </div>
);

/**
 * Stabilized Dispatcher
 */
const StabilizedDispatcher = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'default';
  const hostname = window.location.hostname.toLowerCase();
  
  return (
    <div key={`lgf-root-${hostname}-${view}`} className="min-h-screen bg-[#08090a]">
      <DomainDispatcher view={view} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<StabilizedDispatcher />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
